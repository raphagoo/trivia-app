<template>
    <div class="chat-widget">
        <v-btn v-if="!open" icon color="primary" size="large" class="chat-toggle" @click="open = true">
            <v-badge v-if="unread > 0" :content="unread" color="error">
                <v-icon icon="mdi-chat"></v-icon>
            </v-badge>
            <v-icon v-else icon="mdi-chat"></v-icon>
        </v-btn>

        <v-card v-else class="chat-panel d-flex flex-column">
            <template #title>
                <div class="d-flex align-center">
                    <v-icon icon="mdi-chat" color="primary" class="mr-2"></v-icon>
                    <span class="text-subtitle-1 font-weight-bold">Room Chat</span>
                    <v-spacer></v-spacer>
                    <v-btn icon variant="text" size="small" @click="open = false">
                        <v-icon icon="mdi-close"></v-icon>
                    </v-btn>
                </div>
            </template>

            <v-card-text ref="messageList" class="chat-messages flex-grow-1">
                <div v-if="!messages.length" class="text-center text-grey text-caption pa-4">No messages yet. Say hi!</div>
                <div v-for="(msg, index) in messages" :key="index" class="chat-message mb-2" :class="{ 'chat-message-own': msg.user?._id === user.logged?._id }">
                    <div class="text-caption font-weight-medium" :class="msg.user?._id === user.logged?._id ? 'text-primary' : 'text-grey'">{{ msg.user?.username }}</div>
                    <div class="text-body-2 chat-bubble">{{ msg.message }}</div>
                </div>
            </v-card-text>

            <v-card-actions class="pa-2">
                <v-text-field v-model="draft" placeholder="Type a message..." density="compact" variant="outlined" hide-details single-line maxlength="500" @keyup.enter="send" class="mr-2"></v-text-field>
                <v-btn icon color="primary" :disabled="!draft.trim()" @click="send">
                    <v-icon icon="mdi-send"></v-icon>
                </v-btn>
            </v-card-actions>
        </v-card>
    </div>
</template>

<script lang="ts">
import { mapState, mapActions } from 'vuex'
import { defineComponent } from 'vue'
import { socket } from '../socket'
import { ChatMessage } from '../types/index'

export default defineComponent({
    name: 'chat',
    computed: {
        ...mapState(['room', 'user', 'chat']),
        messages(): Array<ChatMessage> {
            return this.chat.messages
        },
    },
    methods: {
        ...mapActions('chat', {
            addMessage: 'addMessage',
            clearMessages: 'clearMessages',
        }),
        send() {
            const message = this.draft.trim()
            if (!message || !this.room.active?._id) return
            socket.emit('chat_message', { room: this.room.active._id, user: this.user.logged, message })
            this.draft = ''
        },
        scrollToBottom() {
            this.$nextTick(() => {
                const el = this.$refs.messageList as HTMLElement | undefined
                if (el) el.scrollTop = el.scrollHeight
            })
        },
    },
    mounted() {
        socket.on('chat_message', (payload: ChatMessage) => {
            this.addMessage(payload)
            if (this.open) {
                this.scrollToBottom()
            } else if (payload.user?._id !== this.user.logged?._id) {
                this.unread++
            }
        })
    },
    beforeUnmount() {
        socket.off('chat_message')
        this.clearMessages()
    },
    watch: {
        open(isOpen: boolean) {
            if (isOpen) {
                this.unread = 0
                this.scrollToBottom()
            }
        },
    },
    data: () => ({
        open: false,
        draft: '',
        unread: 0,
    }),
})
</script>

<style scoped>
.chat-widget {
    position: fixed;
    bottom: 24px;
    right: 24px;
    z-index: 1000;
}

.chat-toggle {
    box-shadow: 0 4px 15px rgba(108, 99, 255, 0.35);
}

.chat-panel {
    width: 320px;
    height: 420px;
    border: 1px solid rgba(108, 99, 255, 0.2);
    display: flex;
}

.chat-messages {
    overflow-y: auto;
}

.chat-message-own {
    text-align: right;
}

.chat-bubble {
    display: inline-block;
    word-break: break-word;
}
</style>
