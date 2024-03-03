<template>
    <v-row class="bg-blue">
        <v-col class="d-flex justify-end align-center" cols="6">
            <router-link class="mt-2" style="text-decoration: none; color: inherit" to="/">Trivia App</router-link>
        </v-col>
        <v-col class="d-flex justify-end align-center" cols="6">
            <div class="mt-2 mr-2" v-if="user.logged">
                <v-icon icon="mdi-account"></v-icon> <span class="pl-2 pr-2">{{ user.logged.username }}</span>
                <v-icon icon="mdi-logout" @click="logout()"></v-icon>
            </div>
            <div class="mt-2 mr-2" v-else>
                <v-btn variant="text"><router-link style="text-decoration: none; color: inherit" to="/authentication">Login/Register</router-link></v-btn>
            </div>
        </v-col>
    </v-row>
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
