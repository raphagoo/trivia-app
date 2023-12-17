import { Commit } from 'vuex'
import { AxiosResponse } from 'axios'
import api from '../interfaces/apiInterface'
import consoleLogger from '../interfaces/consoleLogger'
import { userState } from '../types'

const state: userState = { logged: null }

const actions = {
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
}

const mutations = {
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
        state.logged = null
        localStorage.removeItem('token')
    },
}

export const user = {
    namespaced: true,
    state,
    actions,
    mutations,
}
