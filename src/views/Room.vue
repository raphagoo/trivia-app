<template>
    <v-container fluid class="pa-4 h-100">
        <!-- Lobby view (before game starts) -->
        <template v-if="!ingame">
            <v-row justify="center">
                <v-col cols="12" md="4">
                    <v-card class="pa-4">
                        <template #title>
                            <div class="d-flex align-center">
                                <v-icon icon="mdi-account-group" color="primary" class="mr-2"></v-icon>
                                <span class="text-h6 font-weight-bold">Players</span>
                                <v-chip variant="flat" color="primary" size="small" class="ml-auto">
                                    {{ activeRoom?.users?.length || 0 }}
                                </v-chip>
                            </div>
                        </template>
                        <v-card-text>
                            <v-slide-y-transition group>
                                <div v-for="player in activeRoom?.users || []" :key="player._id" class="d-flex align-center pa-3 player-item">
                                    <v-avatar :color="player._id === activeRoom?.owner ? 'warning' : 'primary'" size="36" class="mr-3">
                                        <v-icon icon="mdi-account" color="white" size="small"></v-icon>
                                    </v-avatar>
                                    <span class="text-body-2 font-weight-medium">{{ player.username }}</span>
                                    <v-chip v-if="player._id === activeRoom?.owner" color="warning" size="x-small" variant="flat" class="ml-3" prepend-icon="mdi-crown"> Host </v-chip>
                                </div>
                            </v-slide-y-transition>
                            <div v-if="!activeRoom?.users?.length" class="text-center pa-6 text-grey">
                                <v-icon icon="mdi-account-off" size="48" class="mb-2"></v-icon>
                                <div>Waiting for players...</div>
                            </div>
                        </v-card-text>
                    </v-card>
                </v-col>

                <v-col cols="12" md="7">
                    <!-- Host: quiz setup -->
                    <v-card v-if="user.logged?._id === activeRoom?.owner" class="pa-2">
                        <template #title>
                            <div class="d-flex align-center">
                                <v-icon icon="mdi-tune-vertical" color="accent" class="mr-2"></v-icon>
                                <span class="text-h6 font-weight-bold">Quiz Settings</span>
                            </div>
                        </template>
                        <v-card-text>
                            <v-select v-model="selected" :items="tags" :item-props="itemProps" item-value="category" label="Select Categories" multiple persistent-hint hint="Choose trivia categories" clearable class="mb-4"></v-select>

                            <div class="mb-4">
                                <div class="text-subtitle-2 font-weight-medium mb-2">Difficulty</div>
                                <v-chip-group v-model="selectedDifficulties" multiple column>
                                    <v-chip v-for="difficulty in difficulties" :key="difficulty" :value="difficulty" filter variant="outlined" color="primary" class="checkboxDifficulty">
                                        {{ difficulty }}
                                    </v-chip>
                                </v-chip-group>
                            </div>

                            <div class="mb-2">
                                <div class="text-subtitle-2 font-weight-medium mb-1">
                                    <v-icon icon="mdi-timer-outline" size="small" class="mr-1"></v-icon>
                                    Time per Question
                                </div>
                                <v-slider id="sliderSeconds" :min="5" :max="30" step="5" v-model="selectedTime" thumb-label="always" show-ticks="always" tick-size="4" track-size="8" color="primary" track-color="surface-variant" class="px-2">
                                    <template #thumb-label="{ modelValue }">
                                        <strong>{{ modelValue }}s</strong>
                                    </template>
                                </v-slider>
                            </div>

                            <div class="mb-4">
                                <div class="text-subtitle-2 font-weight-medium mb-1">
                                    <v-icon icon="mdi-order-numeric" size="small" class="mr-1"></v-icon>
                                    Number of Questions
                                </div>
                                <v-slider id="sliderNumber" :min="3" :max="15" step="2" v-model="selectedQuestions" thumb-label="always" show-ticks="always" tick-size="4" track-size="8" color="accent" track-color="surface-variant" class="px-2">
                                    <template #thumb-label="{ modelValue }">
                                        <strong>{{ modelValue }} Q</strong>
                                    </template>
                                </v-slider>
                            </div>

                            <v-btn name="startQuizzBtn" color="success" size="x-large" block @click="getQuizz()" prepend-icon="mdi-play-circle" :disabled="selected.length === 0"> Start Game! </v-btn>
                        </v-card-text>
                    </v-card>

                    <!-- Non-host: waiting screen -->
                    <v-card v-else class="pa-6 text-center">
                        <v-icon icon="mdi-loading" size="64" color="primary" class="mb-4 spinning-icon"></v-icon>
                        <div class="text-h5 font-weight-bold mb-2">Waiting for Host...</div>
                        <div class="text-body-1 text-grey">The host is setting up the quiz. Hang tight!</div>
                        <v-progress-linear indeterminate color="primary" class="mt-6"></v-progress-linear>
                    </v-card>
                </v-col>
            </v-row>
        </template>

        <!-- Game view -->
        <v-row v-show="ingame" justify="center">
            <v-col cols="12">
                <Quizz ref="quizzComponent"></Quizz>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import { ref, onMounted } from 'vue'
import { mapActions, mapState } from 'vuex'
import { useRoute } from 'vue-router'
import { socket } from '../socket'
import Quizz from '../components/Quizz.vue'
import { Tag, Room } from '../types/index'

export default {
    name: 'room',
    components: {
        Quizz,
    },
    setup() {
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
        leaveRoom() {
            socket.emit('leave_room', { room: this.room.active._id, user: this.user.logged })
        },
    },
    computed: {
        ...mapState(['tag', 'user', 'room']),
        tags(): Array<Tag> {
            return this.tag.all || []
        },
        activeRoom() {
            console.log('activeRoom')
            console.log(this.room)
            return this.room.all.find((room: Room) => room._id === this.room.active._id)
        },
    },
    mounted() {
        window.addEventListener('beforeunload', this.leaveRoom)
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
        this.leaveRoom()
        socket.off('join_room')
        socket.off('generate_quizz')
        socket.off('started_game')
        socket.off('end_game')
        socket.off('leave_room')
        window.removeEventListener('beforeunload', this.leaveRoom)
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

<style lang="scss" scoped>
.player-item {
    border-bottom: 1px solid rgba(108, 99, 255, 0.1);
    transition: background 0.2s;
    border-radius: 8px;
    &:hover {
        background: rgba(108, 99, 255, 0.05);
    }
    &:last-child {
        border-bottom: none;
    }
}

.spinning-icon {
    animation: spin 2s linear infinite;
}

@keyframes spin {
    100% {
        transform: rotate(360deg);
    }
}
</style>
