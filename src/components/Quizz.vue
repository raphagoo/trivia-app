<template>
    <v-row class="h-100 bg-grey" align="center" justify="center">
        <v-col cols="9">
            <vue-countdown
                ref="vueCountdown"
                :time="countdown"
                @end="verifyAnswer()"
                v-slot="{ seconds }"
            >
                Time Remaining: {{ seconds }} seconds.
                <v-progress-linear
                    :model-value="seconds * 5"
                ></v-progress-linear>
            </vue-countdown>
            <v-card class="elevation-3">
                <v-card-title>{{
                    beautify(quizz.generated[quizz.activeIndex].category)
                }}</v-card-title>
                <v-card-subtitle
                    :class="
                        quizz.generated[quizz.activeIndex].difficultyColorClass
                    "
                    >{{
                        beautify(quizz.generated[quizz.activeIndex].difficulty)
                    }}
                    -
                    {{
                        quizz.generated[quizz.activeIndex].points
                    }}
                    points</v-card-subtitle
                >
                <v-card-text>{{
                    quizz.generated[quizz.activeIndex].question
                }}</v-card-text>
                <v-card-actions
                    class="justify-center answers"
                    v-for="answer in quizz.generated[quizz.activeIndex].answers"
                    :key="answer"
                >
                    <v-checkbox-btn
                        :value="answer"
                        v-model="selectedAnswer"
                    ></v-checkbox-btn>
                    <div class="w-80">{{ answer.answer }}</div>
                </v-card-actions>
            </v-card>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import { mapState, mapActions } from 'vuex'
import Swal from 'sweetalert2'
import VueCountdown from '@chenfengyuan/vue-countdown'
export default {
    name: 'quizz',
    expose: ['reset'],
    components: {
        VueCountdown,
    },
    computed: {
        ...mapState(['quizz']),
    },
    mounted() {
        this.reset()
    },
    methods: {
        reset() {
            console.log('reset')
        },
        verifyAnswer() {
            if (
                this.selectedAnswer ===
                this.quizz.generated[this.quizz.activeIndex].correctAnswer
            ) {
                this.quizz.userScore +=
                    this.quizz.generated[this.quizz.activeIndex].points
            } else {
                window.alert(false)
            }
            this.selectedAnswer = ''
            if (this.quizz.activeIndex + 1 < this.quizz.generated.length) {
                this.nextQuestion()
                this.$refs.vueCountdown.restart()
            } else {
                this.endQuizz()
                Swal.fire({
                    title: 'End of quizz',
                    text: 'You got ' + this.quizz.userScore + ' points',
                    icon: 'success',
                    confirmButtonText: 'yay',
                })
                this.$router.push('/')
            }
        },
        beautify(name: String) {
            // Split the input string by underscores
            const words = name.split('_')

            // Capitalize the first letter of each word and join with spaces
            const result = words
                .map(
                    (word) =>
                        word.charAt(0).toUpperCase() +
                        word.slice(1).toLowerCase(),
                )
                .join(' ')

            return result
        },
        ...mapActions('quizz', {
            nextQuestion: 'nextQuestion',
            endQuizz: 'endQuizz',
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
