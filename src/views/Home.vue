<template>
    <v-row class="w-75 d-flex">
        <v-col cols="9">
            <v-select
            v-model="selected"
            :items="tag.all"
            :item-props="itemProps"
            item-value="category"
            label="Select categories"
            multiple

            persistent-hint
            ></v-select>
            <v-checkbox class="d-flex w-25" :label="difficulty" v-for="difficulty in difficulties" v-model="selectedDifficulties" :value="difficulty" :key="difficulty"></v-checkbox>
        </v-col>
    </v-row>
    <v-row class="w-25 d-flex">
        <v-col cols="12">
            <v-btn @click="getQuizz(selected, selectedDifficulties)">Create Quizz</v-btn>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import {mapActions, mapState} from "vuex";
export default {
    name: 'home',
    components: {
    },
    watch: {
        selectedDifficulties() {
            if(this.selectedDifficulties.length === 0){

            } else {
                this.selected = [];
                this.getAllTags(this.selectedDifficulties)
            }
        }
    },
    methods: {
        itemProps (item: Tag) {
            return {
                title: this.beautify(item.category),
                subtitle: item.value + ' questions available',
            }
        },
        ...mapActions('tag', {
            getAllTags: 'getAllTags',
        }),
        ...mapActions('quizz', {
            generateQuizz: 'generateQuizz',
        }),
        getQuizz(selected: Array<String>, selectedDifficulties: Array<String>){
            let tags = selected.toString();
            let difficulties = selectedDifficulties.toString()
            this.generateQuizz({tags, difficulties}).then(() => {
                this.$router.push('/quizz')
            })
        },
        beautify(name: String) {
            // Split the input string by underscores
            const words = name.split('_');

            // Capitalize the first letter of each word and join with spaces
            const result = words
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');

            return result;
        }
    },
    computed: {
        ...mapState(['tag', 'quizz']),
    },
    mounted() {
        this.getAllTags();
    },
    data: () => ({
        selected: [],
        difficulties: ['easy', 'medium', 'hard'],
        selectedDifficulties: ['easy', 'medium', 'hard']
    })
}
</script>

<style lang="scss" scoped>

</style>
