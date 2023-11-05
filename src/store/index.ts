import { createStore } from 'vuex';
import createPersistedState from 'vuex-persistedstate'
import {tag} from './tag.module'
import { quizz } from './quizz.module';
import { room  } from './room.module';

export const store = createStore({
    modules: {tag, quizz, room},
    plugins: [createPersistedState()]
});
