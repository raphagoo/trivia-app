import axios from 'axios'
import Swal from 'sweetalert2'
import { router } from '../router'
import { default as $log } from '../interfaces/consoleLogger'
const api = axios.create({
    baseURL: import.meta.env.VITE_NODE_API_URL,
})
api.interceptors.request.use(
    (config) => {
        $log.info('api.interceptors.request')
        if (localStorage.getItem('token') !== null) {
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
        $log.debug('test' + error)
        if (401 === error.response.status) {
            Swal.fire({
                title: 'Session Expired',
                text: 'Your session has expired. Would you like to be redirected to the login page?',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#DD6B55',
                confirmButtonText: 'Yes',
            }).then((result) => {
                if (result.value) {
                    router.push('/home/login')
                }
            })
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
