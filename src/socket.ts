import { io } from 'socket.io-client'

// "undefined" means the URL will be computed from the `window.location` object
const URL = process.env.VITE_NODE_ENV === 'production' ? process.env.VITE_NODE_API_URL : 'http://localhost:3000'

export const socket = io(URL)
