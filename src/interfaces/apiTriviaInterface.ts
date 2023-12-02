import axios from 'axios'

const apiTrivia = axios.create({
    baseURL: import.meta.env.VITE_TRIVIA_API_URL,
})

export default apiTrivia
