import consoleLogger from '../interfaces/consoleLogger'
import api from '../interfaces/apiInterface'
import { Commit } from 'vuex'
import { AxiosResponse } from 'axios'
import { roomState, Room, payloadAnswer, payloadJoinLeaveRoom, Question } from '../types'

const state: roomState = { all: [], creating: false, joining: false, quizz: { time: 10, current: null, activeIndex: 0 }, active: null }

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
    updateRoom({ commit }: { commit: Commit }, payload: Object) {
        commit('updateRoom', payload)
    },
    generateQuizz({ commit }: { commit: Commit }, { room }: { room: Room }) {
        commit('generateQuizz', room)
    },
    checkedAnswer({ commit }: { commit: Commit }, payload: Object) {
        commit('checkedAnswer', payload)
    },
    getQuestion({ commit }: { commit: Commit }, payload: string) {
        return new Promise(function (resolve, reject) {
            api.get('/question/' + payload, { headers: { Accept: 'application/json' } })
                .then((response) => {
                    commit('getQuestionSuccess', response.data)
                    resolve(response.data)
                })
                .catch((error) => {
                    commit('getQuestionError', error)
                    reject(error)
                })
        })
    },
    nextQuestion({ commit }: { commit: Commit }, payload: { room: Room, question: Question }) {
        commit('nextQuestionSuccess', payload)
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
    updateRoom(state: roomState, payload: Room) {
        const roomIndex = state.all.findIndex((room) => room._id === payload._id)
        if (roomIndex !== -1) {
            state.all[roomIndex] = payload
        }
    },
    generateQuizzRequest(state: roomState) {
        state.quizz.current = null
    },
    generateQuizz(state: roomState, room: Room) {
        if(state.active) {
            const users = state.active?.users
            state.active = room
            state.active.users = users
        }
    },
    generateQuizzError(state: roomState, error: AxiosResponse) {
        consoleLogger.error(error.data)
        state.quizz.current = null
    },
    checkedAnswer(state: roomState, payload: payloadAnswer) {
        if (state.active?.users && payload.correct) {
            const userIndex = state.active.users.findIndex((user) => user._id === payload.userId)
            // Ensure userIndex is not -1 before accessing state.active.users
            if (userIndex !== -1 && state.quizz.current !== null) {
                state.active.users[userIndex]!.userScore += state.quizz.current.points
            }
        }
    },
    getQuestionSuccess(state: roomState, data: Question) {
        switch (data.difficulty) {
            case 'easy':
                data.points = 10
                data.difficultyColorClass = 'text-green'
                break
            case 'medium':
                data.points = 20
                data.difficultyColorClass = 'text-orange'
                break
            case 'hard':
                data.points = 30
                data.difficultyColorClass = 'text-red'
                break
        }
        state.quizz.current = data
    },
    getQuestionError(state: roomState, error: AxiosResponse) {
        state.quizz.current = null
        consoleLogger.error(error.data)
    },
    nextQuestionSuccess(state: roomState, payload: { room: Room, question: Question }) {
        switch (payload.question.difficulty) {
            case 'easy':
                payload.question.points = 10
                payload.question.difficultyColorClass = 'text-green'
                break
            case 'medium':
                payload.question.points = 20
                payload.question.difficultyColorClass = 'text-orange'
                break
            case 'hard':
                payload.question.points = 30
                payload.question.difficultyColorClass = 'text-red'
                break
        }
        if (state.active) {
            state.active.currentQuestion = payload.room.currentQuestion
            state.active.currentIndex = payload.room.currentIndex
        }
        state.quizz.current = payload.question
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
