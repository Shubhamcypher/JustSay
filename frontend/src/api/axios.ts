import axios from "axios";

const API = axios.create({
    baseURL: "http://localhost:5000/api",
});

// attach token automatically
API.interceptors.request.use((config) => {
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1YzM1MmYyOS0zZTQxLTRkNTYtOWM1Zi01MzhmYTJmZDE3NTgiLCJpYXQiOjE3NzM4NTU4NTYsImV4cCI6MTc3Mzg1Njc1Nn0.ovCHiMPavMfLwtxyiMVAPsTBD_eiAMlqB1cAEKb_7mg";
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default API;