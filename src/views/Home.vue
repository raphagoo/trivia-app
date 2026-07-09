<template>
    <v-row class="justify-center align-start" no-gutters>
        <v-col cols="12" md="5" lg="4">
            <v-card class="pa-2 mb-6">
                <template #title>
                    <div class="d-flex align-center">
                        <v-icon icon="mdi-crown" color="warning" class="mr-2"></v-icon>
                        <span class="text-h6 font-weight-bold">Host a Room</span>
                    </div>
                </template>
                <v-card-text>
                    <v-form @submit.prevent="pushRoom()">
                        <v-text-field
                            name="hostRoomName"
                            v-model="roomName"
                            label="Room Name"
                            placeholder="Enter a fun room name..."
                            clearable
                            :rules="[v => !!v || 'Room name is required']"
                        ></v-text-field>
                        <v-btn
                            name="hostRoomSubmit"
                            type="submit"
                            block
                            color="primary"
                            size="large"
                            :disabled="!roomName"
                            prepend-icon="mdi-plus-circle"
                        >
                            Create Room
                        </v-btn>
                    </v-form>
                </v-card-text>
            </v-card>
        </v-col>

        <v-col cols="12" md="7" lg="6" class="pl-md-6">
            <v-card class="pa-2">
                <template #title>
                    <div class="d-flex align-center">
                        <v-icon icon="mdi-account-group" color="primary" class="mr-2"></v-icon>
                        <span class="text-h6 font-weight-bold">Available Rooms</span>
                        <v-chip variant="flat" color="surface-variant" size="small" class="ml-3">
                            {{ rooms.length }} room{{ rooms.length !== 1 ? 's' : '' }}
                        </v-chip>
                    </div>
                </template>
                <v-card-text>
                    <div v-if="rooms.length === 0" class="text-center pa-8">
                        <v-icon icon="mdi-gamepad-variant-outline" size="64" color="grey" class="mb-4"></v-icon>
                        <div class="text-h6 text-grey">No rooms available</div>
                        <div class="text-body-2 text-grey mt-1">Create one to get started!</div>
                    </div>
                    <div v-else>
                        <v-slide-y-transition group>
                            <v-card
                                v-for="room in rooms"
                                :key="room._id"
                                variant="outlined"
                                class="room-card mb-3"
                                :class="{ 'room-inactive': room.inGame }"
                            >
                                <div class="d-flex align-center pa-4">
                                    <v-avatar :color="room.inGame ? 'grey' : 'primary'" size="40" class="mr-4">
                                        <v-icon icon="mdi-gamepad-variant" color="white"></v-icon>
                                    </v-avatar>
                                    <div class="flex-grow-1">
                                        <div class="text-subtitle-1 font-weight-medium">{{ room.name }}</div>
                                        <div class="d-flex align-center mt-1">
                                            <v-icon icon="mdi-account" size="small" color="grey" class="mr-1"></v-icon>
                                            <span class="text-caption text-grey">{{ room.users.length }} player{{ room.users.length !== 1 ? 's' : '' }} connected</span>
                                            <v-chip v-if="room.inGame" color="warning" size="x-small" class="ml-3" variant="flat">
                                                In Game
                                            </v-chip>
                                        </div>
                                    </div>
                                    <v-btn
                                        v-if="!room.inGame"
                                        class="button-join-room"
                                        color="success"
                                        variant="elevated"
                                        @click="toRoom(room._id)"
                                        prepend-icon="mdi-login"
                                    >
                                        Join
                                    </v-btn>
                                    <v-btn
                                        v-else
                                        disabled
                                        variant="text"
                                        color="grey"
                                    >
                                        Spectate
                                    </v-btn>
                                </div>
                            </v-card>
                        </v-slide-y-transition>
                    </div>
                </v-card-text>
            </v-card>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import { mapActions, mapState } from 'vuex'
import { socket } from '../socket'
import { AxiosResponse } from 'axios'
import { Room } from '../types/index'
export default {
    name: 'home',
    mounted() {
        this.getAllRooms()
        socket.on('create_room', (payload: object) => {
            this.addRoomToList(payload)
        })
        socket.on('join_room', (payload: object) => {
            this.addUserToRoom(payload)
        })
        socket.on('leave_room', (payload: object) => {
            this.removeUserFromRoom(payload)
        })
        socket.on('started_game', (payload: object) => {
            this.updateRoom(payload)
        })
        socket.on('end_game', (payload: object) => {
            this.updateRoom(payload)
        })
    },
    beforeUnmount() {
        socket.off('create_room')
        socket.off('join_room')
        socket.off('leave_room')
        socket.off('started_game')
    },
    computed: {
        ...mapState(['room']),
        ...mapState(['user']),
        rooms(): Array<Room> {
            return this.room.all || [] // Assuming 'all' is an array, handle if it's null or undefined
        },
    },
    methods: {
        pushRoom() {
            if (localStorage.getItem('token') === null) {
                this.createGuestUser()
                    .then(() => {
                        return this.createRoom(this.roomName)
                    })
                    .then((response: AxiosResponse) => {
                        socket.emit('create_room', response.data)
                        return this.joinRoom(response.data._id)
                    })
                    .then((response: AxiosResponse) => {
                        socket.emit('join_room', {
                            room: response.data._id,
                            user: this.user.logged,
                        })
                        this.$router.push('/room/' + response.data._id)
                    })
            } else {
                this.createRoom(this.roomName)
                    .then((response: AxiosResponse) => {
                        socket.emit('create_room', response.data)
                        return this.joinRoom(response.data._id)
                    })
                    .then((response: AxiosResponse) => {
                        socket.emit('join_room', {
                            room: response.data._id,
                            user: this.user.logged,
                        })
                        this.$router.push('/room/' + response.data._id)
                    })
                    .catch((err: unknown) => {
                        console.log(err)
                    })
            }
        },
        ...mapActions('room', {
            createRoom: 'createRoom',
            getAllRooms: 'getAllRooms',
            addRoomToList: 'addRoomToList',
            joinRoom: 'joinRoom',
            addUserToRoom: 'addUserToRoom',
            removeUserFromRoom: 'removeUserFromRoom',
            updateRoom: 'updateRoom',
        }),
        ...mapActions('user', {
            createGuestUser: 'createGuestUser',
        }),
        toRoom(roomId: string) {
            const joinRoomAndNavigate = () => {
                this.joinRoom(roomId)
                    .then(() => {
                        socket.emit('join_room', {
                            room: roomId,
                            user: this.user.logged,
                        })
                        this.$router.push('/room/' + roomId)
                    })
                    .catch((error: unknown) => {
                        console.error('Error joining room:', error)
                    })
            }

            if (localStorage.getItem('token') === null) {
                this.createGuestUser()
                    .then(joinRoomAndNavigate)
                    .catch((error: unknown) => {
                        console.error('Error creating guest user:', error)
                    })
            } else {
                joinRoomAndNavigate()
            }
        },
    },
    data: () => ({
        roomName: '',
        username: '',
    }),
}
</script>
<style lang="scss" scoped>
.room-card {
    transition: all 0.2s ease;
    border-color: rgba(108, 99, 255, 0.2) !important;
    &:hover {
        border-color: rgba(108, 99, 255, 0.6) !important;
        transform: translateX(4px);
        box-shadow: 0 4px 20px rgba(108, 99, 255, 0.15);
    }
}
.room-inactive {
    opacity: 0.6;
    &:hover {
        transform: none;
    }
}
</style>
