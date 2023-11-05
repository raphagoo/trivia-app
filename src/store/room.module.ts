import { router } from '../router';
import consoleLogger from "../interfaces/consoleLogger";
import api from "../interfaces/apiInterface";
import { Commit } from 'vuex';
import { AxiosResponse } from 'axios';

const state = {all: []};

const actions = {
    addRoomToList({commit}: {commit: Commit}, payload){
        commit('addRoomToList', payload)
    },
    getAllRooms({ commit }: { commit: Commit }) {
        return new Promise(function(resolve, reject){
            commit('getAllRoomsRequest');
            api.get('/room', {
                headers: {'Accept': 'application/json'},
            }).then(response => {
                commit('getAllRoomsSuccess', response)
                resolve(response)
            }).catch(error => {
                commit('getAllRoomsError', error)
                reject(error)
            })
        })
    },
    createRoom({commit}: {commit: Commit}, roomName: String){
        return new Promise(function(resolve, reject){
            commit('createRoomRequest');
            api.post('/room',  {
                name: roomName
            }, {
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(response => {
                commit('createRoomSuccess', response)
                resolve(response)
            }).catch(error => {
                commit('createRoomError', error)
                reject(error)
            })
        })
    }
};

const mutations = {
    addRoomToList(state: roomState, payload) {
        state.all.push(payload)
    },
    createRoomRequest(state: roomState){
        state.creating = true
    },
    createRoomSuccess(state: roomState, response: AxiosResponse) {
        state.creating = false
    },
    createRoomError(state: roomState, error: AxiosResponse) {
        consoleLogger.error(error)
        state.creating = false
    },
    getAllRoomsRequest(state: roomState){
        state.all = []
    },
    getAllRoomsSuccess(state: roomState, response: AxiosResponse) {
        state.all = response.data;
    },
    getAllRoomsError(state: roomState, error: AxiosResponse) {
        consoleLogger.error(error)
        state.all = [];
    }
};

export const room = {
    namespaced: true,
    state,
    actions,
    mutations
};
