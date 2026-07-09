<template>
    <v-app>
        <v-main class="app-background">
            <Header />
            <v-container fluid class="pa-6">
                <router-view></router-view>
            </v-container>
        </v-main>
    </v-app>
</template>

<script lang="ts">
import { mapState, mapActions } from 'vuex'
import { defineComponent } from 'vue'
import Header from './components/Header.vue'

export default defineComponent({
    name: 'App',
    components: {
        // eslint-disable-next-line vue/no-reserved-component-names
        Header,
    },
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

<style>
.app-background {
    background: linear-gradient(135deg, #0F0F1A 0%, #1A1A2E 50%, #16213E 100%);
    min-height: 100vh;
}

/* Smooth scrolling */
html {
    scroll-behavior: smooth;
}

/* Custom scrollbar */
::-webkit-scrollbar {
    width: 8px;
}
::-webkit-scrollbar-track {
    background: #1A1A2E;
}
::-webkit-scrollbar-thumb {
    background: #6C63FF;
    border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
    background: #5A52E0;
}
</style>
