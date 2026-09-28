import { Commit } from 'vuex'
import { ChatMessage } from '../types'

const MAX_MESSAGES = 200

const state: { messages: Array<ChatMessage> } = { messages: [] }

const actions = {
    addMessage({ commit }: { commit: Commit }, payload: ChatMessage) {
        commit('addMessage', payload)
    },
    clearMessages({ commit }: { commit: Commit }) {
        commit('clearMessages')
    },
}

const mutations = {
    addMessage(state: { messages: Array<ChatMessage> }, payload: ChatMessage) {
        state.messages.push(payload)
        if (state.messages.length > MAX_MESSAGES) {
            state.messages.splice(0, state.messages.length - MAX_MESSAGES)
        }
    },
    clearMessages(state: { messages: Array<ChatMessage> }) {
        state.messages = []
    },
}

export const chat = {
    namespaced: true,
    state,
    actions,
    mutations,
}
