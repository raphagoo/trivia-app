import { Commit } from 'vuex'
import { AxiosResponse } from 'axios'
import api from '../interfaces/apiInterface'
import consoleLogger from '../interfaces/consoleLogger'
import { userState, User } from '../types'
import { router } from '../router'

const state: userState = { logged: null, profile: null, register: { message: '', error: false }, login: { message: '', error: false } }

const actions = {
    register({ commit }: { commit: Commit }, user: { name: string; password: string }) {
        commit('registerRequest')
        api.post('/user/register', user, { headers: { Accept: 'application/json' } })
            .then((response) => {
                commit('registerSuccess', response)
            })
            .catch((error) => {
                commit('registerError', error.response)
            })
    },
    login({ commit }: { commit: Commit }, user: { email: string; password: string }) {
        commit('loginRequest')
        api.post('/user/login', user, { headers: { Accept: 'application/json' } })
            .then((response) => {
                commit('loginSuccess', response)
            })
            .catch((error) => {
                commit('loginError', error.response)
            })
    },
    createGuestUser({ commit }: { commit: Commit }) {
        return new Promise(function (resolve, reject) {
            commit('createGuestUserRequest')
            api.post(
                '/user/guest',
                {},
                {
                    headers: { Accept: 'application/json' },
                },
            )
                .then((response) => {
                    commit('createGuestUserSuccess', response)
                    resolve(response)
                })
                .catch((error) => {
                    commit('createGuestUserError', error)
                    reject(error)
                })
        })
    },
    logout({ commit }: { commit: Commit }) {
        commit('logout')
    },
    getProfile({ commit }: { commit: Commit }, userId: string) {
        return new Promise(function (resolve, reject) {
            commit('getProfileRequest')
            api.get('/user/' + userId, { headers: { Accept: 'application/json' } })
                .then((response) => {
                    commit('getProfileSuccess', response.data)
                    resolve(response.data)
                })
                .catch((error) => {
                    commit('getProfileError', error)
                    reject(error)
                })
        })
    },
}

const mutations = {
    resetState(state: userState) {
        state.logged = null
        state.register = { message: '', error: false }
        state.login = { message: '', error: false }
    },
    registerRequest(state: userState) {
        state.logged = null
    },
    registerSuccess(state: userState, response: AxiosResponse) {
        state.logged = response.data.user
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('refreshToken', response.data.refresh)
        router.push({ name: 'home' })
    },
    registerError(state: userState, error: AxiosResponse) {
        state.logged = null
        state.register.error = true
        state.register.message = error.data
    },
    loginRequest(state: userState) {
        state.logged = null
    },
    loginSuccess(state: userState, response: AxiosResponse) {
        state.logged = response.data.user
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('refreshToken', response.data.refresh)
        router.push({ name: 'home' })
    },
    loginError(state: userState) {
        state.logged = null
        state.login.error = true
        state.login.message = 'Identifiants incorrects'
    },
    createGuestUserRequest(state: userState) {
        state.logged = null
    },
    createGuestUserSuccess(state: userState, response: AxiosResponse) {
        state.logged = response.data.user
        localStorage.setItem('token', response.data.token)
    },
    createGuestUserError(state: userState, error: AxiosResponse) {
        state.logged = null
        consoleLogger.error(error.data)
    },
    logout(state: userState) {
        router.push({ name: 'home' }).then(() => {
            state.logged = null
            localStorage.removeItem('token')
            localStorage.removeItem('refreshToken')
        })
    },
    getProfileRequest(state: userState) {
        state.profile = null
    },
    getProfileSuccess(state: userState, data: User) {
        state.profile = data
    },
    getProfileError(state: userState, error: AxiosResponse) {
        state.profile = null
        consoleLogger.error(error)
    },
}

export const user = {
    namespaced: true,
    state,
    actions,
    mutations,
}
