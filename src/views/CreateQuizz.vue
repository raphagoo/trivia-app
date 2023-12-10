<template>
    <div v-for="user in activeRoom.users"><span v-if="user._id === activeRoom.owner">Owner : </span>{{ user.username }}</div>
    <v-row v-if="user.logged._id === activeRoom.owner" class="w-75 d-flex">
        <v-col cols="9">
            <v-select v-model="selected" :items="tag.all" :item-props="itemProps" item-value="category" label="Select categories" multiple persistent-hint></v-select>
            <v-checkbox :disabled="user.logged._id !== activeRoom.owner" class="d-flex w-25" :label="difficulty" v-for="difficulty in difficulties" v-model="selectedDifficulties" :value="difficulty" :key="difficulty"></v-checkbox>
        </v-col>
    </v-row>
    <v-row v-if="user.logged._id === activeRoom.owner" class="w-25 d-flex">
        <v-col cols="12">
            <v-btn @click="getQuizz(selected, selectedDifficulties)">Create Quizz</v-btn>
        </v-col>
    </v-row>
    <v-row v-show="ingame">
        <v-col cols="12">
            <Quizz ref="quizzComponent"></Quizz>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import { ref } from 'vue'
import { mapActions, mapState } from 'vuex'
import { useRoute } from 'vue-router'
import { socket } from '../socket'
import ConnectionState from '../components/ConnectionState.vue'
import ConnectionManager from '../components/ConnectionManager.vue'
import Quizz from '../components/Quizz.vue'

const quizzComponent = ref<InstanceType<typeof Quizz>>()
export default {
    name: 'createQuizz',
    components: {
        ConnectionManager,
        ConnectionState,
        Quizz,
    },
    watch: {
        selectedDifficulties() {
            if (this.selectedDifficulties.length === 0) {
            } else {
                this.selected = []
                this.getAllTags(this.selectedDifficulties)
            }
        },
    },
    methods: {
        itemProps(item: Tag) {
            return {
                title: this.beautify(item.category),
                subtitle: item.value + ' questions available',
            }
        },
        ...mapActions('tag', {
            getAllTags: 'getAllTags',
        }),
        ...mapActions('room', {
            addUserToRoom: 'addUserToRoom',
            generateQuizz: 'generateQuizz',
            endQuizz: 'endQuizz',
            removeUserFromRoom: 'removeUserFromRoom',
        }),
        getQuizz(selected: Array<String>, selectedDifficulties: Array<String>) {
            let tags = selected.toString()
            let difficulties = selectedDifficulties.toString()
            socket.emit('generate_quizz', { tags: tags, difficulties: difficulties })
        },
        beautify(name: String) {
            // Split the input string by underscores
            const words = name.split('_')

            // Capitalize the first letter of each word and join with spaces
            const result = words.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')

            return result
        },
    },
    computed: {
        ...mapState(['tag', 'user', 'room']),
        activeRoom() {
            return this.room.all.find((room: Room) => room._id === this.room.active._id)
        },
    },
    mounted() {
        const route = useRoute()
        this.roomId = route.params.roomId
        socket.on('leave_room', (payload: Object) => {
            this.removeUserFromRoom(payload)
        })
        socket.on('join_room', (payload: Object) => {
            console.log('user joined')
            this.addUserToRoom(payload)
        })
        socket.on('generate_quizz', (payload: Array<Question>) => {
            this.generateQuizz(payload).then(() => {
                if(this.user.logged._id === this.room.active.owner) {
                    socket.emit('start_game', {room: this.room.active._id})
                }
            })
        })
        socket.on('started_game', (payload: Room) => {
            console.log('game started')
            this.ingame = true
            this.$refs.quizzComponent.start()
        })
        socket.on('end_game', (payload: Object) => {
            console.log('game ended')
            this.ingame = false
            this.endQuizz()
        })
        this.getAllTags()
    },
    beforeUnmount() {
        socket.emit('leave_room', { room: this.roomId, user: this.user.logged })
    },
    data: () => ({
        selected: [],
        difficulties: ['easy', 'medium', 'hard'],
        selectedDifficulties: ['easy', 'medium', 'hard'],
        roomId: '',
        ingame: false,
    }),
}
</script>

<style lang="scss" scoped></style>
