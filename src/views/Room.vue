<template>
    <v-container class="bg-grey h-100">
        <v-row class="w-50 d-flex">
            <v-col cols="12">
                Liste des joueurs :
                <div v-for="user in activeRoom.users" :key="user._id"><v-icon color="warning" icon="mdi-crown" v-if="user._id === activeRoom.owner && !ingame"></v-icon>{{ user.username }}</div>
            </v-col>
        </v-row>
        <v-row v-if="user.logged._id === activeRoom.owner && !ingame" class="w-75 d-flex">
            <v-col cols="9">
                <v-card class="ml-2">
                    <v-card-title class="d-flex bg-blue">Create a quizz</v-card-title>
                    <v-select class="mt-4 pl-5 pr-5" v-model="selected" :items="tags" :item-props="itemProps" item-value="category" label="Select categories" multiple persistent-hint></v-select>
                    <div class="">
                        <span class="text-subtitle-1 pl-5">Pick difficulties</span>
                        <v-checkbox :disabled="user.logged._id !== activeRoom.owner" class="d-flex w-50 pl-5" :label="difficulty" v-for="difficulty in difficulties" v-model="selectedDifficulties" :value="difficulty" :key="difficulty"></v-checkbox>
                    </div>
                    <v-slider class="w-75 pl-5" label="Secondes par question" :min="5" :max="30" step="5" v-model="selectedTime" thumb-label="always" show-ticks="always" tick-size="2"></v-slider>
                    <v-slider class="w-75 pl-5" label="Nombre de questions" :min="3" :max="15" step="2" v-model="selectedQuestions" thumb-label="always" show-ticks="always" tick-size="2"></v-slider>
                    <v-card-actions class="d-flex justify-center">
                        <v-btn class="bg-success mb-5" @click="getQuizz()">Start !</v-btn>
                    </v-card-actions>
                </v-card>
            </v-col>
        </v-row>
        <v-row v-if="user.logged._id !== activeRoom.owner && !ingame">
            <v-col cols="10">
                <v-card class="ml-2">
                    <v-card-title class="d-flex bg-blue">Host is setting the quizz...</v-card-title>
                </v-card>
            </v-col>
        </v-row>
        <v-row v-show="ingame">
            <v-col cols="12">
                <Quizz ref="quizzComponent"></Quizz>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import { ref, onMounted } from 'vue'
import { mapActions, mapState, useStore } from 'vuex'
import { onBeforeRouteLeave, useRoute } from 'vue-router'
import { socket } from '../socket'
import Quizz from '../components/Quizz.vue'
import { Tag, Room } from '../types/index'

export default {
    name: 'room',
    components: {
        Quizz,
    },
    setup() {
        onBeforeRouteLeave((to, from, next) => {
            const store = useStore()
            socket.emit('leave_room', { room: store.state.room.active._id, user: store.state.user.logged })
            next()
        })
        //code obligatoire pour init des child components
        const quizzComponent = ref<InstanceType<typeof Quizz>>() // Assign dom object reference to "myinput" variable
        onMounted(() => {
            console.log(quizzComponent.value) // Log a DOM object in console
        })
        return { quizzComponent } // WILL NOT WORK WITHOUT THIS
    },
    watch: {
        selectedDifficulties() {
            if (this.selectedDifficulties.length !== 0) {
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
        getQuizz() {
            let tags = this.selected.toString()
            let difficulties = this.selectedDifficulties.toString()
            let time = this.selectedTime.toString()
            let questions = this.selectedQuestions.toString()
            socket.emit('generate_quizz', { tags: tags, difficulties: difficulties, time: time, questions: questions, room: this.activeRoom._id })
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
        tags(): Array<Tag> {
            return this.tag.all || []
        },
        activeRoom() {
            return this.room.all.find((room: Room) => room._id === this.room.active._id)
        },
    },
    mounted() {
        const route = useRoute()
        this.roomId = route.params.roomId as string
        socket.on('leave_room', (payload: Object) => {
            this.removeUserFromRoom(payload)
        })
        socket.on('join_room', (payload: Object) => {
            this.addUserToRoom(payload)
        })
        socket.on('generate_quizz', (payload: Room) => {
            this.generateQuizz(payload).then(() => {
                if (this.user.logged._id === this.room.active.owner) {
                    socket.emit('start_game', { room: this.room.active._id })
                }
            })
        })
        socket.on('started_game', () => {
            this.ingame = true
            this.quizzComponent?.start()
        })
        socket.on('end_game', () => {
            this.ingame = false
            this.endQuizz()
        })
        this.getAllTags()
    },
    beforeUnmount() {
        socket.off('join_room')
        socket.off('generate_quizz')
        socket.off('started_game')
        socket.off('end_game')
        socket.off('leave_room')
    },
    data: () => ({
        selected: [],
        difficulties: ['Easy', 'Medium', 'Hard'],
        selectedDifficulties: ['Easy', 'Medium', 'Hard'],
        selectedTime: 10,
        selectedQuestions: 5,
        roomId: '',
        ingame: false,
    }),
}
</script>

<style lang="scss">
.h-90 {
    height: 95%;
}
</style>
