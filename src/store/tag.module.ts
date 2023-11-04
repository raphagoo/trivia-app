import { router } from '../router';
import consoleLogger from "../interfaces/consoleLogger";
import api from "../interfaces/apiInterface";
import { Commit } from 'vuex';
import { AxiosResponse } from 'axios';

const state = {all: []};

const actions = {
    getAllTags({ commit }: { commit: Commit }, difficulties: String = 'easy,medium,hard') {
        return new Promise(function(resolve, reject){
            commit('getAllTagsRequest');
            api.get('/totals-per-tag?difficulties=' + difficulties, {
                headers: {'Accept': 'application/json'},
            }).then(response => {
                commit('getAllTagsSuccess', response)
                resolve(response)
            }).catch(error => {
                commit('getAllTagsError', error)
                reject(error)
            })
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
        filtered.sort();
        const result = filtered.map(([category, value]) => ({
            category,
            value,
        }));
        state.all = result;
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
