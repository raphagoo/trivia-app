import { router } from '../router';
import consoleLogger from "../interfaces/consoleLogger";
import api from "../interfaces/apiInterface";
import { Commit } from 'vuex';
import { AxiosResponse } from 'axios';

const state = {};

const actions = {
    generateQuizz({ commit }: {commit: Commit}, tags: String) {
        commit('generateQuizzRequest');
        api.get('/questions?categories=' + tags, {
            headers: {'Accept': 'application/json'},
        }).then(response => {
            Promise.resolve(response)
            commit('generateQuizzSuccess', response)
        }).catch(error => {
            Promise.reject(error)
            commit('generateQuizzError', error)
        })
    }
};

const mutations = {
    generateQuizzRequest(state: quizzState){
        state.generated = []
    },
    generateQuizzSuccess(state: quizzState, response: AxiosResponse) {
        response.data.forEach(question => {
            question.incorrectAnswers.push(question.correctAnswer)
            question.answers = shuffle(question.incorrectAnswers)
        });
        state.generated = response.data
        state.active = response.data[0]
    },
    generateQuizzError(state: quizzState, error: AxiosResponse) {
        consoleLogger.error(error)
        state.generated = [];
    }
};

function shuffle(array: Array) {
    let currentIndex = array.length,  randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex > 0) {

      // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

      // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
}

return array;
}

export const quizz = {
    namespaced: true,
    state,
    actions,
    mutations
};
