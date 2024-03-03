import axios from 'axios'
import Swal from 'sweetalert2'
import { default as $log } from '../interfaces/consoleLogger'
const api = axios.create({
    baseURL: import.meta.env.VITE_NODE_API_URL,
})
api.interceptors.request.use(
    (config) => {
        $log.info('Request intercepted')
        if (config.url === '/user/refresh' && localStorage.getItem('refreshToken') !== null) {
            config.headers.Authorization = 'Bearer ' + localStorage.getItem('refreshToken')
        } else if (localStorage.getItem('token') !== null) {
            config.headers.Authorization = 'Bearer ' + localStorage.getItem('token')
        }
        return config
    },
    (error) => {
        Promise.reject(error)
    },
)

api.interceptors.response.use(
    function (response) {
        return response
    },
    function (error) {
        if (401 === error.response.status) {
            api.post('/user/refresh', {}, { headers: { Accept: 'application/json' } })
        } else if (403 === error.response.status) {
            Swal.fire({
                title: 'Forbidden',
                icon: 'error',
            })
        } else {
            return Promise.reject(error)
        }
    },
)
// you may want to add interceptors to instance
// api.interceptors.request.use(
//     (config) => {
//         if (typeof config === 'undefined') {
//             config = {};
//         }
//         if (typeof config.headers === 'undefined') {
//             config.headers = {};
//         }
//         config.headers['My-Header'] = 'value';

//         return config
//     },
//     (error) => Promise.reject(error)
// )

export default api
