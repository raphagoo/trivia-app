import consoleLogger from '../interfaces/consoleLogger'
import api from '../interfaces/apiInterface'
import { Commit } from 'vuex'
import { AxiosResponse } from 'axios'
import { roomState, generatedQuizz, Room, Question, User, payloadAnswer, payloadJoinLeaveRoom } from '../types'

const state: roomState = { all: [], creating: false, joining: false, quizz: { time: 10, generated: [], activeIndex: 0 }, active: null }

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
                    commit('getAllRoomsSuccess', response.data)
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
    generateQuizz({ commit }: { commit: Commit }, { content }: { content: generatedQuizz }) {
        commit('generateQuizz', content)
    },
    checkedAnswer({ commit }: { commit: Commit }, payload: Object) {
        commit('checkedAnswer', payload)
    },
    nextQuestion({ commit }: { commit: Commit }) {
        commit('nextQuestion')
    },
    endQuizz({ commit }: { commit: Commit }) {
        commit('endQuizz')
    },
}

const mutations = {
    addRoomToList(state: roomState, payload: Room) {
        state.all.push(payload)
    },
    addUserToRoom(state: roomState, payload: payloadJoinLeaveRoom) {
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
    removeUserFromRoom(state: roomState, payload: payloadJoinLeaveRoom) {
        const roomToUpdate = state.all.find((room) => room._id === payload.room)
        if (roomToUpdate) {
            state.all.map((room) => {
                if (room._id === payload.room) {
                    const filteredUsers = room.users.filter((user) => user._id !== payload.user._id)
                    room.users = filteredUsers
                    if (state.active && payload.room === state.active._id) {
                        state.active = room
                    }
                }
            })
        }
    },
    checkRoomPopulation(state: roomState) {
        state.all = state.all.filter((room) => room.users.length > 0)
    },
    createRoomRequest(state: roomState) {
        state.creating = true
    },
    createRoomSuccess(state: roomState) {
        state.creating = false
    },
    createRoomError(state: roomState, error: AxiosResponse) {
        consoleLogger.error(error.data)
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
        consoleLogger.error(error.data)
        state.joining = false
    },
    getAllRoomsRequest(state: roomState) {
        state.all = []
    },
    getAllRoomsSuccess(state: roomState, data: Array<Room>) {
        state.all = [...new Set(data)]
    },
    getAllRoomsError(state: roomState, error: AxiosResponse) {
        consoleLogger.error(error.data)
        state.all = []
    },
    generateQuizzRequest(state: roomState) {
        state.quizz.generated = []
    },
    generateQuizz(state: roomState, content: generatedQuizz) {
        console.log(content.questions)
        content.questions.forEach((question: Question) => {
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
        state.quizz.time = parseInt(content.time)
        state.quizz.generated = content.questions
        state.quizz.activeIndex = 0
        state.active?.users.forEach((user: User) => {
            user.userScore = 0
        })
    },
    generateQuizzError(state: roomState, error: AxiosResponse) {
        consoleLogger.error(error.data)
        state.quizz.generated = []
    },
    checkedAnswer(state: roomState, payload: payloadAnswer) {
        console.log('test check')
        if (state.active?.users && payload.correct) {
            const userIndex = state.active.users.findIndex((user) => user._id === payload.userId)
            // Ensure userIndex is not -1 before accessing state.active.users
            if (userIndex !== -1) {
                state.active.users[userIndex]!.userScore += state.quizz.generated[state.quizz.activeIndex].points
            }
        }
    },
    nextQuestion(state: roomState) {
        state.quizz.activeIndex++
    },
    endQuizz(state: roomState) {
        state.quizz.activeIndex = 0
        state.active?.users.forEach((user) => {
            user.userScore = 0
        })
    },
}

export const room = {
    namespaced: true,
    state,
    actions,
    mutations,
}
