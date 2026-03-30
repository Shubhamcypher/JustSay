import axios from "axios";

const API = axios.create({
    baseURL: `http://${window.location.hostname}:5000/api`,
});

// attach token automatically
API.interceptors.request.use((config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default API;