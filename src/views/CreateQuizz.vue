<template>
    <v-row class="w-75 d-flex">
        <v-col cols="9">
            <v-select
            v-model="selected"
            :items="tag.all"
            :item-props="itemProps"
            item-value="category"
            label="Select categories"
            multiple

            persistent-hint
            ></v-select>
            <v-checkbox class="d-flex w-25" :label="difficulty" v-for="difficulty in difficulties" v-model="selectedDifficulties" :value="difficulty" :key="difficulty"></v-checkbox>
        </v-col>
    </v-row>
    <v-row class="w-25 d-flex">
        <v-col cols="12">
            <v-btn @click="getQuizz(selected, selectedDifficulties)">Create Quizz</v-btn>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import {mapActions, mapState} from "vuex";
import { socket } from '../socket';
import ConnectionState from '../components/ConnectionState.vue';
import ConnectionManager from '../components/ConnectionManager.vue';
export default {
    name: 'createQuizz',
    components: {
        ConnectionManager,
        ConnectionState
    },
    watch: {
        selectedDifficulties() {
            if(this.selectedDifficulties.length === 0){

            } else {
                this.selected = [];
                this.getAllTags(this.selectedDifficulties)
            }
        }
    },
    methods: {
        itemProps (item: Tag) {
            return {
                title: this.beautify(item.category),
                subtitle: item.value + ' questions available',
            }
        },
        ...mapActions('tag', {
            getAllTags: 'getAllTags',
        }),
        ...mapActions('quizz', {
            generateQuizz: 'generateQuizz',
        }),
        ...mapActions('room', {
            removeUserFromRoom: 'removeUserFromRoom',
        }),
        getQuizz(selected: Array<String>, selectedDifficulties: Array<String>){
            let tags = selected.toString();
            let difficulties = selectedDifficulties.toString()
            this.generateQuizz({tags, difficulties}).then(() => {
                this.$router.push('/quizz')
            })
        },
        beautify(name: String) {
            // Split the input string by underscores
            const words = name.split('_');

            // Capitalize the first letter of each word and join with spaces
            const result = words
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');

            return result;
        }
    },
    computed: {
        ...mapState(['tag', 'quizz', 'user']),
    },
    mounted() {
        socket.on('leave_room', (payload: Object) => {
            this.removeUserFromRoom(payload)
        });
        this.getAllTags();
    },
    beforeUnmount() {
        socket.emit('leave_room', {room: this.$route.params.roomId, user: this.user.logged})
    },
    data: () => ({
        selected: [],
        difficulties: ['easy', 'medium', 'hard'],
        selectedDifficulties: ['easy', 'medium', 'hard']
    })
}
</script>

<style lang="scss" scoped>

</style>
