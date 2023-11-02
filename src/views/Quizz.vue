<template>
    <v-row>
        <v-col cols="9">
            <div>
                {{ this.quizz.active.category }} -
                {{ this.quizz.active.question.text }}
                <div class="d-flex w-25" v-for="answer in this.quizz.active.answers" :key="answer">
                    <v-checkbox-btn :value="answer" v-model="this.selectedAnswer"></v-checkbox-btn> {{ answer }}
                </div>
                {{ this.selectedAnswer }}
                <v-btn v-if="this.selectedAnswer !== ''" @click="verifyAnswer()" class="bg-green">Submit</v-btn>
            </div>
        </v-col>
    </v-row>
</template>


<script lang="ts">
import {mapState} from "vuex";
export default {
    name: 'quizz',
    computed: {
        ...mapState(['quizz']),
    },
    methods: {
        verifyAnswer(){
            if(this.selectedAnswer === this.quizz.active.correctAnswer){
                window.alert(true)
            } else {
                window.alert(false)
            }
        }
    },
    data: () => ({
        selectedAnswer: ''
    })
}
</script>

<style>

</style>
