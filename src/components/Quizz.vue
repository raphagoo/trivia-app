<template>
    <v-row class="h-100 bg-grey" align="center" justify="center">
        <v-col cols="9">
            <vue-countdown ref="vueCountdown" :auto-start="false" :time="countdown" @end="verifyAnswer()" v-slot="{ seconds }">
                Time Remaining: {{ seconds }} seconds.
                <v-progress-linear :model-value="seconds * forProgress"></v-progress-linear>
            </vue-countdown>
            <v-card v-if="ingame" class="elevation-3">
                <v-card-title>{{ beautify(room.quizz.current.category) }}</v-card-title>
                <v-card-subtitle :class="room.quizz.current.difficultyColorClass"
                    >{{ beautify(room.quizz.current.difficulty) }}
                    -
                    {{ room.quizz.current.points }}
                    points</v-card-subtitle
                >
                <v-card-text>{{ room.quizz.current.question }}</v-card-text>
                <v-card-actions class="justify-center answers" :id="answer._id" v-for="answer in room.quizz.current.answers" :key="answer">
                    <v-checkbox-btn :value="answer" v-model="selectedAnswer"></v-checkbox-btn>
                    <div class="w-80">{{ answer.answer }}</div>
                </v-card-actions>
            </v-card>
        </v-col>
        <v-col cols="3">
            <div v-for="user in room.active.users" :key="user._id">{{ user.username }} : {{ user.userScore }}</div>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import { mapState, mapActions } from 'vuex'
import Swal from 'sweetalert2'
import VueCountdown from '@chenfengyuan/vue-countdown'
import { socket } from '../socket'
import { ref, defineComponent, onMounted } from 'vue'
import { payloadAnswer, Room, User } from '../types/index'

export default defineComponent({
    name: 'quizz',
    expose: ['start'],
    components: {
        VueCountdown,
    },
    computed: {
        ...mapState(['user', 'room']),
    },
    setup() {
        const vueCountdown = ref<InstanceType<typeof VueCountdown>>() // Assign dom object reference to "myinput" variable
        onMounted(() => {
            console.log(vueCountdown.value) // Log a DOM object in console
        })
        return { vueCountdown } // WILL NOT WORK WITHOUT THIS
    },
    mounted() {
        socket.on('checked_answer', (payload: payloadAnswer) => {
            this.checkedAnswer(payload)
            const foundUser = this.room.active.users.find((user: User) => user._id === this.user.logged._id)
            if (payload.userId === foundUser._id) {
                document.getElementById(payload.answerCorrectId)?.classList.add('bg-success')
                if (payload.answerCorrectId !== this.selectedAnswer._id) {
                    document.getElementById(this.selectedAnswer._id)?.classList.add('bg-error')
                }
                this.selectedAnswer = { _id: '0', answer: '' }
            }
        }),
            socket.on('next_question', (payload: Room) => {
                if (payload.inGame === false) {
                    const foundUser = this.room.active.users.find((user: User) => user._id === this.user.logged._id)
                    Swal.fire({
                        title: 'End of quizz',
                        text: 'You got ' + foundUser.userScore + ' points',
                        icon: 'success',
                        confirmButtonText: 'yay',
                    })
                    if (this.room.active.owner === this.user.logged._id) {
                        socket.emit('end_game', { room: this.room.active._id })
                    }
                } else {
                    this.nextQuestion(payload)
                    this.vueCountdown?.start()
                }
            })
    },
    beforeUnmount() {
        socket.off('checked_answer')
    },
    methods: {
        start() {
            this.getQuestion(this.room.active._id).then(() => {
                this.countdown = this.room.quizz.time * 1000
                //Il faut que ca fasse 100 quand on multiplie par les secondes pour avoir un pourcentage
                this.forProgress = 100 / this.room.quizz.time
                this.vueCountdown?.start()
                this.ingame = true
            })
        },
        verifyAnswer() {
            socket.emit('check_answer', { answer: this.selectedAnswer, user: this.user.logged, question: this.room.quizz.current })
            if (this.room.active.owner === this.user.logged._id) {
                setTimeout(() => {
                    socket.emit('next_question', { room: this.room.active._id })
                }, 5000)
            }
        },
        beautify(name: String) {
            // Split the input string by underscores
            const words = name.split('_')

            // Capitalize the first letter of each word and join with spaces
            const result = words.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')

            return result
        },
        ...mapActions('room', {
            nextQuestion: 'nextQuestion',
            checkedAnswer: 'checkedAnswer',
            getQuestion: 'getQuestion',
        }),
    },
    data: () => ({
        selectedAnswer: { _id: '0', answer: '' },
        countdown: 5 * 1000,
        forProgress: 10,
        ingame: false,
    }),
})
</script>

<style>
.answers {
    border-bottom: 1px solid black;
}
</style>
