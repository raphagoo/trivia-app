<template>
    <v-app>
    <v-main>
        <router-view></router-view>
    </v-main>
    </v-app>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import CreateQuizz from './views/CreateQuizz.vue'

export default defineComponent({
    name: 'App',

    components: {
        CreateQuizz,
    },

    data () {
        return {
          //
        }
    },
})
</script>
