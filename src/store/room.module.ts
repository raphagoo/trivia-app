import { router } from '../router'
import consoleLogger from '../interfaces/consoleLogger'
import api from '../interfaces/apiInterface'
import { Commit } from 'vuex'
import { AxiosResponse } from 'axios'

const state = { all: [], quizz: {}, active: null }

const actions = {
    addRoomToList({ commit }: { commit: Commit }, payload: Object) {
        commit('addRoomToList', payload)
    },
    addUserToRoom({ commit }: { commit: Commit }, payload: Object) {
        commit('addUserToRoom', payload)
    },
    removeUserFromRoom({ commit }: { commit: Commit }, payload: Object) {
        commit('removeUserFromRoom', payload)
        commit('checkRoomPopulation')
    },
    getAllRooms({ commit }: { commit: Commit }) {
        return new Promise(function (resolve, reject) {
            commit('getAllRoomsRequest')
            api.get('/room', {
                headers: { Accept: 'application/json' },
            })
                .then((response) => {
                    commit('getAllRoomsSuccess', response)
                    resolve(response)
                })
                .catch((error) => {
                    commit('getAllRoomsError', error)
                    reject(error)
                })
        })
    },
    joinRoom({ commit }: { commit: Commit }, roomId: number) {
        return new Promise(function (resolve, reject) {
            commit('joinRoomRequest')
            api.post(
                '/room/join/' + roomId,
                {},
                {
                    headers: { Accept: 'application/json' },
                },
            )
                .then((response) => {
                    commit('joinRoomSuccess', response)
                    resolve(response)
                })
                .catch((error) => {
                    commit('joinRoomError', error)
                    reject(error)
                })
        })
    },
    createRoom({ commit }: { commit: Commit }, roomName: String) {
        return new Promise(function (resolve, reject) {
            commit('createRoomRequest')
            api.post(
                '/room',
                {
                    name: roomName,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                },
            )
                .then((response) => {
                    commit('createRoomSuccess', response)
                    resolve(response)
                })
                .catch((error) => {
                    commit('createRoomError', error)
                    reject(error)
                })
        })
    },
    generateQuizz({ commit }: { commit: Commit }, { questions }: { questions: Array<Question> }) {
        commit('generateQuizz', questions)
    },
    checkedAnswer({ commit }: { commit: Commit }, payload: Object) {
        commit('checkedAnswer', payload)
    },
    nextQuestion({ commit }: { commit: Commit }) {
        commit('nextQuestion')
    },
    endQuizz({ commit }: { commit: Commit }) {
        commit('resetActiveIndex')
    },
}

const mutations = {
    addRoomToList(state: roomState, payload: Room) {
        state.all.push(payload)
    },
    addUserToRoom(state: roomState, payload: any) {
        const roomToUpdate = state.all.find((room) => room._id === payload.room)
        if (roomToUpdate) {
            state.all.map((room) => {
                if (room._id === payload.room) {
                    payload.user.userScore = 0
                    room.users.push(payload.user)
                    room.users = [...new Set(room.users)]
                    if (state.active !== null && payload.room === state.active._id) {
                        state.active = room
                    }
                }
            })
        }
    },
    removeUserFromRoom(state: roomState, payload: any) {
        const roomToUpdate = state.all.find((room) => room._id === payload.room)
        if (roomToUpdate) {
            state.all.map((room) => {
                if (room._id === payload.room) {
                    let filteredUsers = room.users.filter((user) => user._id !== payload.user._id)
                    room.users = filteredUsers
                    if (state.active && payload.room._id === state.active._id) {
                        state.active = room
                    }
                }
            })
        }
    },
    checkRoomPopulation(state: roomState) {
        state.all.forEach((room) => {
            console.log(room)
        })
        state.all = state.all.filter((room) => room.users.length > 0)
    },
    createRoomRequest(state: roomState) {
        state.creating = true
    },
    createRoomSuccess(state: roomState, response: AxiosResponse) {
        state.creating = false
    },
    createRoomError(state: roomState, error: AxiosResponse) {
        consoleLogger.error(error)
        state.creating = false
    },
    joinRoomRequest(state: roomState) {
        state.joining = true
    },
    joinRoomSuccess(state: roomState, response: AxiosResponse) {
        state.joining = false
        state.active = response.data
    },
    joinRoomError(state: roomState, error: AxiosResponse) {
        consoleLogger.error(error)
        state.joining = false
    },
    getAllRoomsRequest(state: roomState) {
        state.all = []
    },
    getAllRoomsSuccess(state: roomState, response: AxiosResponse) {
        state.all = [...new Set(response.data)]
    },
    getAllRoomsError(state: roomState, error: AxiosResponse) {
        consoleLogger.error(error)
        state.all = []
    },
    generateQuizzRequest(state: roomState) {
        state.quizz.generated = []
    },
    generateQuizz(state: roomState, questions: Array<Question>) {
        questions.forEach((question: Question) => {
            switch (question.difficulty) {
                case 'easy':
                    question.points = 10
                    question.difficultyColorClass = 'text-green'
                    break
                case 'medium':
                    question.points = 20
                    question.difficultyColorClass = 'text-orange'
                    break
                case 'hard':
                    question.points = 30
                    question.difficultyColorClass = 'text-red'
                    break
            }
        })
        state.quizz.generated = questions
        state.quizz.activeIndex = 0
        state.active.users.forEach((user: User) => {
            user.userScore = 0
        })
    },
    generateQuizzError(state: roomState, error: AxiosResponse) {
        consoleLogger.error(error)
        state.quizz.generated = []
    },
    checkedAnswer(state: roomState, payload: payloadAnswer) {
        if (payload.correct) {
            let userIndex = state.active.users.findIndex((user) => user._id === payload.user)
            state.active.users[userIndex].userScore += state.quizz.generated[state.quizz.activeIndex].points
        }
    },
    nextQuestion(state: roomState) {
        state.quizz.activeIndex++
    },
    resetActiveIndex(state: roomState) {
        state.quizz.activeIndex = 0
    },
}

export const room = {
    namespaced: true,
    state,
    actions,
    mutations,
}
