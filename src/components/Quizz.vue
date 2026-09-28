<template>
    <v-row justify="center">
        <v-col cols="12" lg="9">
            <!-- Hidden countdown for question timer (only rendered when game is active) -->
            <vue-countdown v-if="ingame && countdownMs > 0" ref="vueCountdown" :auto-start="false" :time="countdownMs" @end="onTimeUp" style="display: none"></vue-countdown>

            <!-- Timer bar -->
            <v-card class="mb-4 pa-2" variant="flat" color="transparent">
                <div class="d-flex align-center mb-2">
                    <v-icon icon="mdi-timer-sand" :color="timerColor" class="mr-2"></v-icon>
                    <span class="text-h5 font-weight-bold" :style="{ color: timerColor }">{{ timerDisplay }}</span>
                </div>
                <v-progress-linear :model-value="timerProgress" :color="timerColor" height="8" rounded class="smooth-progress"></v-progress-linear>
            </v-card>

            <!-- Between-questions countdown overlay -->
            <v-fade-transition>
                <v-card v-if="showingNextCountdown" class="pa-6 mb-4 text-center" variant="outlined" color="primary">
                    <div class="text-h5 font-weight-bold mb-2">Next question in...</div>
                    <div class="text-h1 font-weight-black text-primary">{{ nextCountdown }}</div>
                </v-card>
            </v-fade-transition>

            <!-- Scoreboard -->
            <v-row class="mb-4">
                <v-col v-for="player in room.active?.users || []" :key="player._id" cols="6" sm="4" md="3" lg="2">
                    <v-card variant="outlined" class="pa-2 text-center score-card" :class="{ 'current-player': player._id === user.logged?._id }">
                        <v-avatar :color="player._id === room.active?.owner ? 'warning' : 'primary'" size="28" class="mb-1">
                            <span class="text-caption font-weight-bold white--text">{{ player.username?.charAt(0)?.toUpperCase() }}</span>
                        </v-avatar>
                        <div class="text-caption font-weight-medium text-truncate">{{ player.username }}</div>
                        <div class="text-h6 font-weight-bold" :class="player._id === user.logged?._id ? 'text-primary' : ''">
                            {{ player.userScore || 0 }}
                        </div>
                    </v-card>
                </v-col>
            </v-row>

            <!-- Question card -->
            <v-card v-if="ingame && room.quizz?.current && !showLeaderboard" class="question-card pa-4">
                <div class="d-flex align-center mb-3">
                    <v-chip :color="difficultyColor" variant="flat" size="small" class="mr-2">
                        {{ beautify(room.quizz.current.difficulty) }}
                    </v-chip>
                    <v-chip variant="outlined" color="grey" size="small" class="mr-2">
                        {{ beautify(room.quizz.current.category) }}
                    </v-chip>
                    <v-spacer></v-spacer>
                    <v-chip variant="flat" color="accent" size="small"> {{ room.quizz.current.points }} pts </v-chip>
                </div>

                <v-card-title class="text-h5 font-weight-bold pa-0 mb-6 question-text">
                    {{ room.quizz.current.question }}
                </v-card-title>

                <v-card-text class="pa-0">
                    <v-row>
                        <v-col v-for="answer in room.quizz.current.answers" :key="answer._id" cols="12" md="6">
                            <v-card
                                :id="answer._id"
                                class="answer-card"
                                variant="outlined"
                                :class="{
                                    'answer-selected': selectedAnswer?._id === answer._id,
                                    'answer-correct': showResult && answer._id === correctAnswerId,
                                    'answer-wrong': showResult && selectedAnswer?._id === answer._id && answer._id !== correctAnswerId,
                                }"
                                @click="selectAnswer(answer)"
                                :disabled="showResult"
                            >
                                <div class="d-flex align-center pa-4">
                                    <v-avatar size="32" :color="selectedAnswer?._id === answer._id ? 'primary' : 'surface-variant'" class="mr-3">
                                        <span class="text-body-2 font-weight-bold">{{ getAnswerLetter(answer._id) }}</span>
                                    </v-avatar>
                                    <span class="text-body-1 font-weight-medium">{{ answer.answer }}</span>
                                </div>
                            </v-card>
                        </v-col>
                    </v-row>
                </v-card-text>
            </v-card>

            <!-- Post-game Leaderboard -->
            <v-fade-transition>
                <v-card v-if="showLeaderboard" class="leaderboard-card pa-6">
                    <template #title>
                        <div class="text-center mb-4">
                            <v-icon icon="mdi-trophy" color="warning" size="48" class="mb-2"></v-icon>
                            <div class="text-h4 font-weight-bold">Game Over!</div>
                            <div class="text-body-1 text-grey mt-1">Final Standings</div>
                        </div>
                    </template>
                    <v-card-text class="pa-0">
                        <v-slide-y-transition group>
                            <router-link
                                v-for="(player, index) in leaderboard"
                                :key="player._id"
                                :to="'/profile/' + player._id"
                                class="leaderboard-row d-flex align-center pa-4"
                                :class="{
                                    'rank-gold': index === 0,
                                    'rank-silver': index === 1,
                                    'rank-bronze': index === 2,
                                    'current-player-row': player._id === user.logged?._id,
                                }"
                            >
                                <div class="rank-badge d-flex align-center justify-center mr-4">
                                    <v-icon v-if="index === 0" color="warning" icon="mdi-trophy" size="28"></v-icon>
                                    <v-icon v-else-if="index === 1" color="#C0C0C0" icon="mdi-trophy" size="24"></v-icon>
                                    <v-icon v-else-if="index === 2" color="#CD7F32" icon="mdi-trophy" size="20"></v-icon>
                                    <span v-else class="text-h6 font-weight-bold text-grey">{{ index + 1 }}</span>
                                </div>
                                <v-avatar :color="player._id === room.active?.owner ? 'warning' : 'primary'" size="40" class="mr-3">
                                    <span class="text-body-1 font-weight-bold white--text">{{ player.username?.charAt(0)?.toUpperCase() }}</span>
                                </v-avatar>
                                <div class="flex-grow-1">
                                    <div class="text-subtitle-1 font-weight-medium">
                                        {{ player.username }}
                                        <v-chip v-if="player._id === room.active?.owner" color="warning" size="x-small" variant="flat" class="ml-2"> Host </v-chip>
                                    </div>
                                </div>
                                <div class="text-h5 font-weight-bold" :class="'rank-score-' + (index === 0 ? 'gold' : index === 1 ? 'silver' : index === 2 ? 'bronze' : 'normal')">{{ player.userScore || 0 }} <span class="text-caption font-weight-regular">pts</span></div>
                            </router-link>
                        </v-slide-y-transition>
                    </v-card-text>
                    <v-card-actions class="justify-center pt-6">
                        <v-btn color="primary" size="large" variant="elevated" prepend-icon="mdi-home" @click="goHome"> Back to Rooms </v-btn>
                    </v-card-actions>
                </v-card>
            </v-fade-transition>
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
        timerColor(): string {
            const secs = Math.ceil(this.countdownSeconds)
            if (secs > 10) return 'accent'
            if (secs > 5) return 'warning'
            return 'error'
        },
        timerDisplay(): string {
            const secs = Math.max(0, Math.ceil(this.countdownSeconds))
            const m = Math.floor(secs / 60)
            const s = secs % 60
            return `${m}:${s.toString().padStart(2, '0')}`
        },
        timerProgress(): number {
            if (!this.room.active?.time) return 0
            return (this.countdownSeconds / this.room.active.time) * 100
        },
        difficultyColor(): string {
            const d = this.room.quizz?.current?.difficulty?.toLowerCase() || ''
            if (d === 'easy') return 'success'
            if (d === 'medium') return 'warning'
            if (d === 'hard') return 'error'
            return 'primary'
        },
    },
    setup() {
        const vueCountdown = ref<InstanceType<typeof VueCountdown>>()
        onMounted(() => {
            console.log(vueCountdown.value)
        })
        return { vueCountdown }
    },
    mounted() {
        ;(socket.on('checked_answer', (payload: payloadAnswer) => {
            this.checkedAnswer(payload)
            const foundUser = this.room.active.users.find((user: User) => user._id === this.user.logged._id)
            if (payload.userId === foundUser._id) {
                this.correctAnswerId = payload.answerCorrectId
                this.showResult = true
                if (payload.answerCorrectId !== this.selectedAnswer._id) {
                    this.selectedWrong = true
                }
            }
            // Start between-questions countdown for everyone
            this.startNextCountdown()
        }),
            socket.on('next_question', (payload: Room) => {
                if (payload.inGame === false) {
                    // Build leaderboard sorted by score descending
                    const players = [...(this.room.active?.users || [])]
                    players.sort((a: User, b: User) => (b.userScore || 0) - (a.userScore || 0))
                    this.leaderboard = players
                    this.showLeaderboard = true
                } else {
                    this.showingNextCountdown = false
                    this.nextQuestion(payload)
                    this.selectedAnswer = { _id: '0', answer: '' }
                    this.showResult = false
                    this.correctAnswerId = ''
                    this.selectedWrong = false
                    // Start the question timer
                    this.countdownMs = this.room.active.time * 1000
                    this.countdownSeconds = this.room.active.time
                    this._timerStart = Date.now()
                    this.startSmoothTimer()
                    this.$nextTick(() => {
                        this.vueCountdown?.start()
                    })
                }
            }))
    },
    beforeUnmount() {
        socket.off('checked_answer')
        socket.off('next_question')
        if (this._nextInterval) clearInterval(this._nextInterval as unknown as number)
        if (this._rafId) cancelAnimationFrame(this._rafId)
    },
    methods: {
        start() {
            this.getQuestion(this.room.active._id).then(() => {
                this.countdownMs = this.room.active.time * 1000
                this.countdownSeconds = this.room.active.time
                this.ingame = true
                this._timerStart = Date.now()
                this.startSmoothTimer()
                this.$nextTick(() => {
                    this.vueCountdown?.start()
                })
            })
        },
        startSmoothTimer() {
            const tick = () => {
                if (!this.ingame) return
                const elapsed = Date.now() - this._timerStart
                const remaining = Math.max(0, this.countdownMs - elapsed)
                this.countdownSeconds = remaining / 1000
                if (remaining > 0) {
                    this._rafId = requestAnimationFrame(tick)
                }
            }
            this._rafId = requestAnimationFrame(tick)
        },
        onTimeUp() {
            this.countdownSeconds = 0
            this.verifyAnswer()
        },
        verifyAnswer() {
            if (this.selectedAnswer._id === '0' || !this.selectedAnswer._id) {
                // No answer selected — send empty
            }
            socket.emit('check_answer', { answer: this.selectedAnswer, user: this.user.logged, question: this.room.quizz.current })
            if (this.room.active.owner === this.user.logged._id) {
                setTimeout(() => {
                    socket.emit('next_question', { room: this.room.active._id })
                }, 5000)
            }
        },
        startNextCountdown() {
            if (this._nextInterval) clearInterval(this._nextInterval as unknown as number)
            this.nextCountdown = 5
            this.showingNextCountdown = true
            this._nextInterval = setInterval(() => {
                this.nextCountdown--
                if (this.nextCountdown <= 0) {
                    clearInterval(this._nextInterval as unknown as number)
                }
            }, 1000)
        },
        selectAnswer(answer: { _id: string; answer: string }) {
            if (this.showResult) return
            this.selectedAnswer = answer
        },
        goHome() {
            if (this.room.active?.owner === this.user.logged?._id) {
                socket.emit('end_game', { room: this.room.active._id })
            }
            this.showLeaderboard = false
            this.ingame = false
            this.$router.push('/')
        },
        getAnswerLetter(answerId: string): string {
            const answers = this.room.quizz?.current?.answers || []
            const index = answers.findIndex((a: { _id: string }) => a._id === answerId)
            return String.fromCharCode(65 + index) // A, B, C, D...
        },
        beautify(name: String) {
            const words = name.split('_')
            const result = words.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ')
            return result
        },
        ...mapActions('room', {
            nextQuestion: 'nextQuestion',
            checkedAnswer: 'checkedAnswer',
            getQuestion: 'getQuestion',
        }),
    },
    data() {
        return {
            selectedAnswer: { _id: '0', answer: '' },
            countdownMs: 0,
            countdownSeconds: 0,
            ingame: false,
            showResult: false,
            correctAnswerId: '',
            selectedWrong: false,
            showingNextCountdown: false,
            nextCountdown: 5,
            showLeaderboard: false,
            leaderboard: [] as Array<{ _id: string; username: string; userScore: number }>,
            _timerStart: 0,
            _rafId: 0,
            _nextInterval: null as unknown as ReturnType<typeof setInterval> | null,
        }
    },
})
</script>

<style scoped>
.question-card {
    border: 1px solid rgba(108, 99, 255, 0.2);
}

.question-text {
    line-height: 1.5;
}

.answer-card {
    cursor: pointer;
    transition: all 0.2s ease;
    border-color: rgba(255, 255, 255, 0.1) !important;
}
.answer-card:hover:not(:disabled) {
    border-color: rgba(108, 99, 255, 0.5) !important;
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(108, 99, 255, 0.15);
}
.answer-selected {
    border-color: #6c63ff !important;
    background: rgba(108, 99, 255, 0.1) !important;
}
.answer-correct {
    border-color: #00d9a6 !important;
    background: rgba(0, 217, 166, 0.15) !important;
}
.answer-correct .v-avatar {
    background: #00d9a6 !important;
}
.answer-wrong {
    border-color: #ff4757 !important;
    background: rgba(255, 71, 87, 0.15) !important;
}
.answer-wrong .v-avatar {
    background: #ff4757 !important;
}

.score-card {
    border-color: rgba(255, 255, 255, 0.08) !important;
}
.current-player {
    border-color: #6c63ff !important;
    background: rgba(108, 99, 255, 0.08) !important;
}

.smooth-progress :deep(.v-progress-linear__determinate) {
    transition: width 0.1s linear !important;
}

.leaderboard-card {
    border: 1px solid rgba(108, 99, 255, 0.2);
}

.leaderboard-row {
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    margin-bottom: 4px;
    transition: all 0.2s ease;
    text-decoration: none;
    color: inherit;
}
.leaderboard-row:last-child {
    border-bottom: none;
}
.leaderboard-row:hover {
    background: rgba(108, 99, 255, 0.05);
}

.rank-gold {
    background: linear-gradient(135deg, rgba(255, 215, 0, 0.1), rgba(255, 215, 0, 0.02)) !important;
}
.rank-silver {
    background: linear-gradient(135deg, rgba(192, 192, 192, 0.08), rgba(192, 192, 192, 0.02)) !important;
}
.rank-bronze {
    background: linear-gradient(135deg, rgba(205, 127, 50, 0.08), rgba(205, 127, 50, 0.02)) !important;
}

.current-player-row {
    outline: 1px solid rgba(108, 99, 255, 0.4);
    outline-offset: -1px;
}

.rank-badge {
    width: 40px;
    height: 40px;
}

.rank-score-gold {
    color: #ffd700;
}
.rank-score-silver {
    color: #c0c0c0;
}
.rank-score-bronze {
    color: #cd7f32;
}
.rank-score-normal {
    color: rgba(255, 255, 255, 0.7);
}
</style>
