import { createStore } from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import { tag } from './tag.module'
import { room } from './room.module'
import { user } from './user.module'
import { chat } from './chat.module'

export const store = createStore({
    modules: { tag, room, user, chat },
    plugins: [createPersistedState({ paths: ['tag', 'room', 'user'] })],
})
