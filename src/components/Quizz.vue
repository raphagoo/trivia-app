<template>
    <v-row class="h-100 bg-grey" align="center" justify="center">
        <v-col cols="9">
            <vue-countdown ref="vueCountdown" :time="countdown" @end="verifyAnswer()" v-slot="{ seconds }">
                Time Remaining: {{ seconds }} seconds.
                <v-progress-linear :model-value="seconds * 5"></v-progress-linear>
            </vue-countdown>
            <v-card class="elevation-3">
                <v-card-title>{{ beautify(room.quizz.generated[room.quizz.activeIndex].category) }}</v-card-title>
                <v-card-subtitle :class="room.quizz.generated[room.quizz.activeIndex].difficultyColorClass"
                    >{{ beautify(room.quizz.generated[room.quizz.activeIndex].difficulty) }}
                    -
                    {{ room.quizz.generated[room.quizz.activeIndex].points }}
                    points</v-card-subtitle
                >
                <v-card-text>{{ room.quizz.generated[room.quizz.activeIndex].question }}</v-card-text>
                <v-card-actions class="justify-center answers" v-for="answer in room.quizz.generated[room.quizz.activeIndex].answers" :key="answer">
                    <v-checkbox-btn :value="answer" v-model="selectedAnswer"></v-checkbox-btn>
                    <div class="w-80">{{ answer.answer }}</div>
                </v-card-actions>
            </v-card>
        </v-col>
        <v-col cols="3">
            <div v-for="user in room.active.users">{{ user.username }} : {{ user.userScore }}</div>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import { mapState, mapActions } from 'vuex'
import Swal from 'sweetalert2'
import VueCountdown from '@chenfengyuan/vue-countdown'
import { socket } from '../socket'
export default {
    name: 'quizz',
    expose: ['reset'],
    components: {
        VueCountdown,
    },
    computed: {
        ...mapState(['user', 'room']),
    },
    mounted() {
        this.reset()
        socket.on('checked_answer', (payload: Object) => {
            console.log('answer checked')
            this.checkedAnswer(payload)
        })
    },
    methods: {
        reset() {
            console.log('reset')
        },
        verifyAnswer() {
            socket.emit('check_answer', { answer: this.selectedAnswer, user: this.user.logged })
            this.selectedAnswer = ''
            if (this.room.quizz.activeIndex + 1 < this.room.quizz.generated.length) {
                this.nextQuestion()
                this.$refs.vueCountdown.restart()
            } else {
                const foundUser = this.room.active.users.find((user: User) => user._id === this.user.logged._id)
                this.$refs.vueCountdown.restart()
                this.endQuizz()
                Swal.fire({
                    title: 'End of quizz',
                    text: 'You got ' + foundUser.userScore + ' points',
                    icon: 'success',
                    confirmButtonText: 'yay',
                })
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
            endQuizz: 'endQuizz',
            checkedAnswer: 'checkedAnswer',
        }),
    },
    data: () => ({
        selectedAnswer: '',
        countdown: 20 * 1000,
    }),
}
</script>

<style>
.answers {
    border-bottom: 1px solid black;
}
</style>
