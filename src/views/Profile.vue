<template>
    <v-container>
        <v-row justify="center" class="mt-4">
            <v-col cols="12" sm="10" md="7" lg="6">
                <v-card v-if="profile" class="pa-4">
                    <v-card-text class="text-center pb-6">
                        <v-avatar color="secondary" size="80" class="mb-3">
                            <span class="text-h4 font-weight-bold white--text">{{ profile.username.charAt(0).toUpperCase() }}</span>
                        </v-avatar>
                        <div class="text-h5 font-weight-bold">{{ profile.username }}</div>
                    </v-card-text>

                    <v-row>
                        <v-col cols="6" sm="3">
                            <v-card variant="outlined" class="pa-3 text-center stat-card">
                                <v-icon icon="mdi-gamepad-variant" color="primary" size="28" class="mb-1"></v-icon>
                                <div class="text-h5 font-weight-bold">{{ stats.gamesPlayed }}</div>
                                <div class="text-caption text-grey">Games Played</div>
                            </v-card>
                        </v-col>
                        <v-col cols="6" sm="3">
                            <v-card variant="outlined" class="pa-3 text-center stat-card">
                                <v-icon icon="mdi-star" color="warning" size="28" class="mb-1"></v-icon>
                                <div class="text-h5 font-weight-bold">{{ stats.totalScore }}</div>
                                <div class="text-caption text-grey">Total Score</div>
                            </v-card>
                        </v-col>
                        <v-col cols="6" sm="3">
                            <v-card variant="outlined" class="pa-3 text-center stat-card">
                                <v-icon icon="mdi-check-circle" color="success" size="28" class="mb-1"></v-icon>
                                <div class="text-h5 font-weight-bold">{{ stats.correctAnswers }} / {{ stats.totalAnswers }}</div>
                                <div class="text-caption text-grey">Correct Answers</div>
                            </v-card>
                        </v-col>
                        <v-col cols="6" sm="3">
                            <v-card variant="outlined" class="pa-3 text-center stat-card">
                                <v-icon icon="mdi-target" color="accent" size="28" class="mb-1"></v-icon>
                                <div class="text-h5 font-weight-bold">{{ accuracy }}%</div>
                                <div class="text-caption text-grey">Accuracy</div>
                            </v-card>
                        </v-col>
                    </v-row>
                </v-card>

                <v-card v-else class="pa-6 text-center">
                    <v-progress-circular v-if="loading" indeterminate color="primary" class="mb-4"></v-progress-circular>
                    <div v-else>
                        <v-icon icon="mdi-account-off" size="48" class="mb-2"></v-icon>
                        <div class="text-body-1 text-grey">Profile not found.</div>
                    </div>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import { mapState, mapActions } from 'vuex'
import { defineComponent } from 'vue'
import { useRoute } from 'vue-router'
import { UserStats } from '../types/index'

export default defineComponent({
    name: 'profile',
    computed: {
        ...mapState(['user']),
        profile() {
            return this.user.profile
        },
        stats(): UserStats {
            return this.profile?.stats || { gamesPlayed: 0, totalScore: 0, correctAnswers: 0, totalAnswers: 0 }
        },
        accuracy(): number {
            if (!this.stats.totalAnswers) return 0
            return Math.round((this.stats.correctAnswers / this.stats.totalAnswers) * 100)
        },
    },
    methods: {
        ...mapActions('user', {
            getProfile: 'getProfile',
        }),
    },
    mounted() {
        const route = useRoute()
        const targetId = (route.params.id as string) || this.user.logged?._id
        if (!targetId) {
            this.$router.push('/authentication')
            return
        }
        this.loading = true
        this.getProfile(targetId).finally(() => {
            this.loading = false
        })
    },
    data: () => ({
        loading: false,
    }),
})
</script>

<style scoped>
.stat-card {
    border-color: rgba(255, 255, 255, 0.08) !important;
}
</style>
