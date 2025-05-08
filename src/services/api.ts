import axios from "axios"

const API_URL = "https://admin.sinir.gov.br"

const api = axios.create({
    baseURL: API_URL
})

export default api