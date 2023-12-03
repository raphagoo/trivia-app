import { createStore } from 'vuex'
import createPersistedState from 'vuex-persistedstate'
import { tag } from './tag.module'
import { room } from './room.module'
import { user } from './user.module'

export const store = createStore({
    modules: { tag, room, user },
    plugins: [createPersistedState()],
})
