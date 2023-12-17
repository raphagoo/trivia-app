<template>
    <v-row>
        <v-col cols="6">
            <v-form @submit.prevent="pushRoom()">
                <v-text-field v-model="roomName" label="Room Name"></v-text-field>
                <v-btn type="submit" block class="mt-2">Host</v-btn>
            </v-form>
        </v-col>
        <v-col cols="6">
            <div v-for="room in rooms" :key="room._id">
                {{ room.name }} - {{ room.users.length }} users connected
                <div v-if="room.inGame">En jeu</div>
                <v-btn @click="toRoom(room._id)">Join</v-btn>
            </div>
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
    },
    beforeUnmount() {
        socket.off('create_room')
        socket.off('join_room')
        socket.off('leave_room')
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
                    .catch((err) => {
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
        }),
        ...mapActions('user', {
            createGuestUser: 'createGuestUser',
        }),
        toRoom(roomId: string) {
            if (localStorage.getItem('token') === null) {
                this.createGuestUser()
                    .then(() => {
                        this.joinRoom(roomId)
                    })
                    .then(() => {
                        socket.emit('join_room', {
                            room: roomId,
                            user: this.user.logged,
                        })
                        this.$router.push('/room/' + roomId)
                    })
            } else {
                this.joinRoom(roomId).then(() => {
                    socket.emit('join_room', {
                        room: roomId,
                        user: this.user.logged,
                    })
                    this.$router.push('/room/' + roomId)
                })
            }
        },
    },
    data: () => ({
        roomName: '',
        username: '',
    }),
}
</script>
<style lang="scss" scoped></style>
