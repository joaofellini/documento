import axios from "axios";


export const api = axios.create({
    baseURL: 'https://api.clarifai.com/',
    headers:{
        "Authorization": "Key 9c3fbe30d5f0466ebc206ef1fe0dab10"
    }
})