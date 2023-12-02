<template>
    <v-row>
        <v-col cols="6">
            <v-form @submit.prevent="pushRoom()">
                <v-text-field
                    v-model="roomName"
                    label="Room Name"
                ></v-text-field>
                <v-btn type="submit" block class="mt-2">Host</v-btn>
            </v-form>
        </v-col>
        <v-col cols="6">
            <div v-for="room in room.all" :key="room._id">
                {{ room.name }} - {{ room.users.length }} users connected
                <v-btn @click="toRoom(room._id)">Join</v-btn>
            </div>
        </v-col>
    </v-row>
</template>

<script lang="ts">
import { mapActions, mapState } from 'vuex'
import { socket } from '../socket'
import ConnectionState from '../components/ConnectionState.vue'
import ConnectionManager from '../components/ConnectionManager.vue'
export default {
    name: 'home',
    components: {
        ConnectionManager,
        ConnectionState,
    },
    mounted() {
        this.getAllRooms()
        socket.on('create_room', (payload: Object) => {
            this.addRoomToList(payload)
        })
        socket.on('join_room', (payload: Object) => {
            this.addUserToRoom(payload)
        })
        socket.on('leave_room', (payload: Object) => {
            this.removeUserFromRoom(payload)
        })
    },
    computed: {
        ...mapState(['room', 'user']),
    },
    methods: {
        pushRoom() {
            if (localStorage.getItem('token') === null) {
                this.createGuestUser()
                    .then(() => {
                        return this.createRoom(this.roomName)
                    })
                    .then((response: any) => {
                        socket.emit('create_room', response.data)
                        return this.joinRoom(response.data._id)
                    })
                    .then((response: any) => {
                        socket.emit('join_room', {
                            room: response.data._id,
                            user: this.user.logged,
                        })
                        this.$router.push('/room/' + response.data._id)
                    })
            } else {
                this.createRoom(this.roomName)
                    .then((response: any) => {
                        socket.emit('create_room', response.data)
                        return this.joinRoom(response.data._id)
                    })
                    .then((response: any) => {
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
        toRoom(roomId: number) {
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
