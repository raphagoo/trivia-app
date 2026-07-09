<template>
    <v-container>
        <v-row justify="center" class="mt-4">
            <v-col cols="12" sm="10" md="8" lg="6">
                <v-tabs v-model="activeTab" color="primary" align-tabs="center" grow class="mb-4">
                    <v-tab value="login" class="text-h6">
                        <v-icon icon="mdi-login" class="mr-2"></v-icon>
                        Login
                    </v-tab>
                    <v-tab value="register" class="text-h6">
                        <v-icon icon="mdi-account-plus" class="mr-2"></v-icon>
                        Register
                    </v-tab>
                </v-tabs>

                <!-- Login -->
                <v-window v-model="activeTab">
                    <v-window-item value="login">
                        <v-card class="pa-4">
                            <template #title>
                                <div class="text-center mb-2">
                                    <v-icon icon="mdi-lightning-bolt" color="primary" size="40"></v-icon>
                                    <div class="text-h5 font-weight-bold mt-2">Welcome Back!</div>
                                    <div class="text-body-2 text-grey">Sign in to continue playing</div>
                                </div>
                            </template>
                            <v-card-text>
                                <v-alert
                                    type="error"
                                    v-if="user.login.error"
                                    class="text-center mb-4"
                                    variant="tonal"
                                    closable
                                    icon="mdi-alert-circle"
                                >{{ user.login.message }}</v-alert>
                                <v-form @submit.prevent="sendLogin" ref="loginFormRef">
                                    <v-text-field
                                        name="loginUsername"
                                        v-model="loginForm.username"
                                        label="Username"
                                        prepend-inner-icon="mdi-account"
                                        autocomplete="username"
                                        :rules="[v => !!v || 'Username is required']"
                                    ></v-text-field>
                                    <v-text-field
                                        name="loginPassword"
                                        v-model="loginForm.password"
                                        label="Password"
                                        :type="loginShowPassword ? 'text' : 'password'"
                                        prepend-inner-icon="mdi-lock"
                                        :append-inner-icon="loginShowPassword ? 'mdi-eye-off' : 'mdi-eye'"
                                        @click:append-inner="loginShowPassword = !loginShowPassword"
                                        autocomplete="current-password"
                                        :rules="[v => !!v || 'Password is required']"
                                    ></v-text-field>
                                    <v-btn
                                        :disabled="!isLoginFormValid"
                                        name="loginSubmit"
                                        type="submit"
                                        color="primary"
                                        size="large"
                                        block
                                        class="mt-2"
                                    >
                                        Login
                                    </v-btn>
                                </v-form>
                            </v-card-text>
                        </v-card>
                    </v-window-item>

                    <!-- Register -->
                    <v-window-item value="register">
                        <v-card class="pa-4">
                            <template #title>
                                <div class="text-center mb-2">
                                    <v-icon icon="mdi-account-plus" color="primary" size="40"></v-icon>
                                    <div class="text-h5 font-weight-bold mt-2">Create Account</div>
                                    <div class="text-body-2 text-grey">Join the trivia fun!</div>
                                </div>
                            </template>
                            <v-card-text>
                                <v-alert
                                    type="error"
                                    v-if="user.register.error"
                                    class="text-center mb-4"
                                    variant="tonal"
                                    closable
                                    icon="mdi-alert-circle"
                                >{{ user.register.message }}</v-alert>
                                <v-form @submit.prevent="sendRegister" ref="registerFormRef">
                                    <v-text-field
                                        name="registerUsername"
                                        v-model="registerForm.username"
                                        label="Username"
                                        prepend-inner-icon="mdi-account"
                                        autocomplete="username"
                                        :rules="[v => !!v || 'Username is required']"
                                    ></v-text-field>

                                    <v-text-field
                                        name="registerPassword"
                                        v-model="registerForm.password"
                                        label="Password"
                                        :type="registerShowPassword ? 'text' : 'password'"
                                        prepend-inner-icon="mdi-lock"
                                        :append-inner-icon="registerShowPassword ? 'mdi-eye-off' : 'mdi-eye'"
                                        @click:append-inner="registerShowPassword = !registerShowPassword"
                                        autocomplete="new-password"
                                        :rules="[v => !!v || 'Password is required']"
                                    >
                                        <template #append>
                                            <v-tooltip text="Generate strong password" location="top">
                                                <template #activator="{ props }">
                                                    <v-btn
                                                        v-bind="props"
                                                        icon="mdi-dice"
                                                        variant="text"
                                                        size="small"
                                                        color="primary"
                                                        @click="generatePassword"
                                                        class="mt-n1"
                                                    ></v-btn>
                                                </template>
                                            </v-tooltip>
                                        </template>
                                    </v-text-field>

                                    <!-- Password strength -->
                                    <div class="mt-4 mb-2">
                                        <div class="d-flex align-center mb-1">
                                            <span class="text-caption font-weight-medium">Password Strength</span>
                                            <v-chip
                                                :color="passwordStrengthColors[passwordStrength.id]"
                                                size="x-small"
                                                variant="flat"
                                                class="ml-auto"
                                            >
                                                {{ passwordStrength.value }}
                                            </v-chip>
                                        </div>
                                        <v-progress-linear
                                            :model-value="(passwordStrength.id + 1) * 25"
                                            :color="passwordStrengthColors[passwordStrength.id]"
                                            height="6"
                                            rounded
                                        ></v-progress-linear>
                                    </div>

                                    <v-btn
                                        name="registerSubmit"
                                        :disabled="[0, 1].includes(passwordStrength.id) || !isRegisterFormValid"
                                        type="submit"
                                        color="primary"
                                        size="large"
                                        block
                                        class="mt-4"
                                    >
                                        Create Account
                                    </v-btn>
                                </v-form>
                            </v-card-text>
                        </v-card>
                    </v-window-item>
                </v-window>
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
        activeTab: 'login',
        registerForm: {
            username: '',
            password: '',
        },
        loginForm: {
            username: '',
            password: '',
        },
        loginShowPassword: false,
        registerShowPassword: false,
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
        generatePassword() {
            const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
            const lower = 'abcdefghijklmnopqrstuvwxyz'
            const digits = '0123456789'
            const special = '!@#$%^&*()-_=+[]{}|;:,.<>?'
            const all = upper + lower + digits + special

            // Ensure at least one character from each category
            let pwd = ''
            pwd += upper[Math.floor(Math.random() * upper.length)]
            pwd += lower[Math.floor(Math.random() * lower.length)]
            pwd += digits[Math.floor(Math.random() * digits.length)]
            pwd += special[Math.floor(Math.random() * special.length)]

            // Fill remaining to reach 16 characters
            for (let i = pwd.length; i < 16; i++) {
                pwd += all[Math.floor(Math.random() * all.length)]
            }

            // Shuffle using Fisher-Yates
            const arr = pwd.split('')
            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1))
                ;[arr[i], arr[j]] = [arr[j], arr[i]]
            }

            this.registerForm.password = arr.join('')
        },
    },
}
</script>

<style scoped>
/* Smooth tab transitions */
.v-window-item {
    transition: opacity 0.2s ease;
}
</style>
