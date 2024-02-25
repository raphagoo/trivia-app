<template>
    <v-app>
        <v-main>
            <Header />
            <router-view></router-view>
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
