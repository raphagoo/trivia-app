import { router } from '../router';
import consoleLogger from "../interfaces/consoleLogger";
import api from "../interfaces/apiInterface";
import { Commit } from 'vuex';
import { AxiosResponse } from 'axios';

const state = {};

const actions = {
    generateQuizz({ commit }: {commit: Commit}, {tags = '', difficulties = 'easy,medium,hard'}: {tags: String, difficulties: String}) {
        return new Promise(function(resolve, reject){
            commit('generateQuizzRequest');
            let url = '/questions?limit=3&difficulties=' + difficulties
            if(tags !== '') {
                url += '&tags=' + tags
            }
            api.get(url, {
                headers: {'Accept': 'application/json'},
            }).then(response => {
                commit('generateQuizzSuccess', response)
                resolve(response)
            }).catch(error => {
                commit('generateQuizzError', error)
                reject(error)
            })
        })
    },

    nextQuestion({commit}: {commit:Commit}) {
        commit('nextQuestion');
    },

    endQuizz({commit}: {commit:Commit}) {
        commit('resetActiveIndex');
    },
};

const mutations = {
    generateQuizzRequest(state: quizzState){
        state.generated = []
    },
    generateQuizzSuccess(state: quizzState, response: AxiosResponse) {
        response.data.forEach((question: Question) => {
            switch(question.difficulty) {
                case 'easy':
                    question.points = 10
                    question.difficultyColorClass = 'text-green'
                    break;
                case 'medium':
                    question.points = 20
                    question.difficultyColorClass = 'text-orange'
                    break;
                case 'hard':
                    question.points = 30
                    question.difficultyColorClass = 'text-red'
                    break;
            }
            question.incorrectAnswers.push(question.correctAnswer)
            question.answers = shuffle(question.incorrectAnswers)
        });
        state.generated = response.data
        state.activeIndex = 0
        state.userScore = 0
    },
    generateQuizzError(state: quizzState, error: AxiosResponse) {
        consoleLogger.error(error)
        state.generated = [];
    },
    nextQuestion(state: quizzState) {
        state.activeIndex++;
    },
    resetActiveIndex(state: quizzState){
        state.activeIndex = 0;
    }
};

function shuffle(array: Array<Question>) {
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
