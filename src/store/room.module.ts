import { router } from '../router';
import consoleLogger from "../interfaces/consoleLogger";
import api from "../interfaces/apiInterface";
import { Commit } from 'vuex';
import { AxiosResponse } from 'axios';

const state = {all: []};

const actions = {
    addRoomToList({commit}: {commit: Commit}, payload: Object){
        commit('addRoomToList', payload)
    },
    addUserToRoom({commit}: {commit: Commit}, payload: Object){
        commit('addUserToRoom', payload)
    },
    removeUserFromRoom({commit}: {commit: Commit}, payload: Object){
        commit('removeUserFromRoom', payload)
        commit('checkRoomPopulation')
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
    joinRoom({ commit }: { commit: Commit }, roomId: number) {
        return new Promise(function(resolve, reject){
            commit('joinRoomRequest');
            api.post('/room/join/' + roomId, {}, {
                headers: {'Accept': 'application/json'},
            }).then(response => {
                commit('joinRoomSuccess', response)
                resolve(response)
            }).catch(error => {
                commit('joinRoomError', error)
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
    addRoomToList(state: roomState, payload: Room) {
        state.all.push(payload)
    },
    addUserToRoom(state: roomState, payload: any) {
        const roomToUpdate = state.all.find(room => room._id === payload.room);
        if(roomToUpdate) {
            state.all.map(room => {
                if(room._id === payload.room) {
                    room.users.push(payload.user)
                    room.users = [...new Set(room.users)];
                }
            });
        }
    },
    removeUserFromRoom(state: roomState, payload: any) {
        console.log(state.all)

        const roomToUpdate = state.all.find(room => room._id === payload.room);
        if(roomToUpdate) {
            state.all.map(room => {
                if(room._id === payload.room) {
                    let filteredUsers = room.users.filter(user => user._id !== payload.user._id)
                    room.users = filteredUsers
                }
            });
        }
    },
    checkRoomPopulation(state: roomState){
        console.log(state.all)
        state.all.forEach(room => {
            console.log(room)
        })
        state.all = state.all.filter((room) => room.users.length > 0);
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
    joinRoomRequest(state: roomState){
        state.joining = true
    },
    joinRoomSuccess(state: roomState, response: AxiosResponse) {
        state.joining = false
        state.active = response.data._id
    },
    joinRoomError(state: roomState, error: AxiosResponse) {
        consoleLogger.error(error)
        state.joining = false
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
