<template>
    <v-app-bar flat density="compact" class="header-bar pa-2" height="64">
        <router-link to="/" style="text-decoration: none; color: inherit" class="d-flex align-center">
            <v-icon icon="mdi-lightning-bolt" color="primary" size="32" class="mr-2"></v-icon>
            <span class="text-h5 font-weight-bold"> Trivia<span class="text-primary">Quest</span> </span>
        </router-link>

        <v-spacer></v-spacer>

        <div v-if="user.logged" class="d-flex align-center">
            <v-avatar color="secondary" size="36" class="mr-3">
                <span class="text-body-2 font-weight-medium white--text">{{ user.logged.username.charAt(0).toUpperCase() }}</span>
            </v-avatar>
            <span class="text-body-2 mr-4">{{ user.logged.username }}</span>
            <v-btn icon variant="text" color="grey" @click="logout()" title="Logout">
                <v-icon icon="mdi-logout"></v-icon>
            </v-btn>
        </div>
        <div v-else>
            <v-btn variant="tonal" color="primary" prepend-icon="mdi-account" to="/authentication" size="small"> Login / Register </v-btn>
        </div>
    </v-app-bar>
</template>

<script lang="ts">
import { mapState, mapActions } from 'vuex'
import { defineComponent } from 'vue'

export default defineComponent({
    // eslint-disable-next-line vue/no-reserved-component-names
    name: 'Header',
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

<style scoped>
.header-bar {
    border-bottom: 1px solid rgba(108, 99, 255, 0.2) !important;
    backdrop-filter: blur(12px);
    background: rgba(15, 15, 26, 0.85) !important;
}
</style>
