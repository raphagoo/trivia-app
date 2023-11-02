import { createStore } from 'vuex';
import createPersistedState from 'vuex-persistedstate'
import {tag} from './tag.module'
import { quizz } from './quizz.module';

export const store = createStore({
    modules: {tag, quizz},
    plugins: [createPersistedState()]
});
