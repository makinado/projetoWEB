import axios from 'axios'
import { showError } from '@/global'

const success = res => res

const error = err => {
    if (401 === err.response.status) {
        window.location.href = '/'
        // alert('acesso negado')
    } else {
        return Promise.reject(err)
    }
}

axios.interceptors.response.use(success, error)