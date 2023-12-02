<template>
    <v-app>
        <v-main>
            <div v-if="user.logged">
                You are {{ user.logged.username }}
                <v-btn @click="logout()">Logout</v-btn>
            </div>
            <router-view></router-view>
        </v-main>
    </v-app>
</template>

<script lang="ts">
import { mapState, mapActions } from 'vuex'
import { defineComponent } from 'vue'

export default defineComponent({
    name: 'App',
    computed: {
        ...mapState(['user']),
    },
    methods: {
        ...mapActions('user', {
            logout: 'logout',
        }),
    },
    data() {
        return {
            //
        }
    },
})
</script>
