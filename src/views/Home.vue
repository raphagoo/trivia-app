<template>
    <connection-manager></connection-manager>
    <connection-state></connection-state>
    <v-row>
        <v-col cols="6">
            <v-form @submit.prevent="pushRoom()">
                <v-text-field v-model="roomName" label="Room Name"></v-text-field>
                <v-btn type="submit" block class="mt-2">Host</v-btn>
            </v-form>
        </v-col>
        <v-col cols="6">
            <div v-for="room in room.all" :key="room._id">
                {{ room.name }}
                <v-btn>Join</v-btn>
            </div>

        </v-col>
    </v-row>
</template>

<script lang="ts">
import {mapActions, mapState} from "vuex";
import { socket } from "../socket";
import ConnectionState from '../components/ConnectionState.vue';
import ConnectionManager from '../components/ConnectionManager.vue';
export default {
    name: 'home',
    components: {
        ConnectionManager,
        ConnectionState
    },
    mounted() {
        console.log('socket connected')
        this.getAllRooms()
        socket.on('create_room', payload => {
            console.log('la room doit create')
            this.addRoomToList(payload)
        });
    },
    computed: {
        ...mapState(['room']),
    },
    methods: {
        pushRoom() {
            this.createRoom(this.roomName).then(response => {
                console.log('ca passe')
                socket.emit('create_room', response.data)
            })
        },
        ...mapActions('room', {
            createRoom: 'createRoom',
            getAllRooms: 'getAllRooms',
            addRoomToList: 'addRoomToList',
        }),
    },
    data: () => ({
        roomName: '',
        username: ''
    })
}
</script>
<style lang="scss" scoped>

</style>
