<template>
    <v-row>
        <v-col
            cols="9">
            <v-list lines="two">
                <v-list-item class="ma-3 w-50 bg-primary" v-for="(value, name, index) in this.tag.all" :key="index">
                    <v-list-item-title>{{ name }}</v-list-item-title>
                    <v-list-item-subtitle>{{ value }} questions available</v-list-item-subtitle>
                    <v-list-item-action end>
                        <v-checkbox-btn :value="name" v-model="this.selected"></v-checkbox-btn>
                    </v-list-item-action>
                </v-list-item>
            </v-list>
        </v-col>
        <v-col cols="3">
            Selected : {{ selected }}
            <v-btn @click="getQuizz(this.selected)">Create Quizz</v-btn>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import {mapActions, mapState} from "vuex";
export default {
    name: 'home',
    components: {
    },
    methods: {
        ...mapActions('tag', {
            getAllTags: 'getAllTags',
        }),
        ...mapActions('quizz', {
            generateQuizz: 'generateQuizz',
        }),
        getQuizz(selected){

            let tags = selected.toString();
            console.log(tags)
            this.generateQuizz(tags).then(response => {
                this.$router.push('/quizz')
            })
        }
    },
    computed: {
        ...mapState(['tag']),
    },
    mounted() {
        this.getAllTags();
    },
    data: () => ({
        selected: []
    })
}
</script>

<style lang="scss" scoped>

</style>
