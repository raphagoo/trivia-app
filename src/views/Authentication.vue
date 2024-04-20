<template>
    <v-container>
        <v-row justify="center">
            <v-col cols="12" sm="8" md="6">
                <v-card class="elevation-12">
                    <v-card-title class="text-center bg-grey">Login</v-card-title>
                    <v-card-text class="pt-5">
                        <v-alert type="error" v-if="user.login.error" class="text-center mb-3" dense>{{ user.login.message }}</v-alert>
                        <v-form @submit.prevent="sendLogin">
                            <v-text-field v-model="loginForm.username" label="Username"></v-text-field>
                            <v-text-field v-model="loginForm.password" label="Password" type="password"></v-text-field>
                            <v-btn :disabled="!isLoginFormValid" type="submit" color="primary">Login</v-btn>
                        </v-form>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
        <v-row justify="center">
            <v-col cols="12" sm="8" md="6">
                <v-card class="elevation-12">
                    <v-card-title class="text-center bg-grey">Register</v-card-title>
                    <v-card-text class="pt-5">
                        <v-alert type="error" v-if="user.register.error" class="text-center mb-3" dense>{{ user.register.message }}</v-alert>
                        <v-form @submit.prevent="sendRegister">
                            <v-text-field v-model="registerForm.username" label="Username"></v-text-field>
                            <v-text-field v-model="registerForm.password" label="Password" type="password"></v-text-field>
                            <div class="w-100">
                                <v-progress-linear class="mb-2" min="0" max="3" v-model="passwordStrength.id" :color="passwordStrengthColors[passwordStrength.id]" height="3"></v-progress-linear>
                                <span>{{ passwordStrength.value }}</span>
                            </div>
                            <v-btn :disabled="[0, 1].includes(passwordStrength.id) && !isRegisterFormValid" class="mt-3" type="submit" color="primary">Register</v-btn>
                        </v-form>
                    </v-card-text>
                </v-card>
            </v-col>
        </v-row>
    </v-container>
</template>

<script lang="ts">
import { mapActions, mapState, mapMutations } from 'vuex'
import { passwordStrength } from 'check-password-strength'
export default {
    name: 'Authentication',
    created() {
        this.resetState()
    },
    data: () => ({
        registerForm: {
            username: '',
            password: '',
        },
        loginForm: {
            username: '',
            password: '',
        },
        passwordStrengthColors: ['error', 'error', 'warning', 'success'],
    }),
    computed: {
        ...mapState(['user']),
        passwordStrength() {
            return passwordStrength(this.registerForm.password)
        },
        isLoginFormValid() {
            return this.loginForm.username !== '' && this.loginForm.password !== ''
        },
        isRegisterFormValid() {
            return this.registerForm.username !== '' && this.registerForm.password !== ''
        },
    },
    methods: {
        ...mapMutations('user', {
            resetState: 'resetState',
        }),
        ...mapActions('user', {
            register: 'register',
            login: 'login',
        }),
        sendRegister() {
            this.register(this.registerForm)
        },
        sendLogin() {
            this.login(this.loginForm)
        },
    },
}
</script>

<style scoped>
/* Add custom styles here */
</style>
