import { router } from '../router';
import consoleLogger from "../interfaces/consoleLogger";
import api from "../interfaces/apiInterface";
import { Commit } from 'vuex';
import { AxiosResponse } from 'axios';

const state = {all: []};

const actions = {
    getAllTags({ commit }: { commit: Commit }) {
        commit('getAllTagsRequest');
        api.get('/totals-per-tag', {
            headers: {'Accept': 'application/json'},
        }).then(response => {
            Promise.resolve(response)
            commit('getAllTagsSuccess', response)
        }).catch(error => {
            Promise.reject(error)
            commit('getAllTagsError', error)
        })
    }
};

const mutations = {
    getAllTagsRequest(state: tagState){
        state.all = []
    },
    getAllTagsSuccess(state: tagState, response: AxiosResponse) {
        const asArray = Object.entries(response.data);
        const filtered = asArray.filter(([key, value]) => value >= 50);
        const justStrings = Object.fromEntries(filtered);
        state.all = justStrings;
    },
    getAllTagsError(state: tagState, error: AxiosResponse) {
        consoleLogger.error(error)
        state.all = [];
    }
};

export const tag = {
    namespaced: true,
    state,
    actions,
    mutations
};
