
import axios from "axios";
import { authStore } from "@/authStore";

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];



const API = axios.create({
  baseURL: `http://${window.location.hostname}:5000/api`,
});

// Attach access token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});


function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}



function addSubscriber(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}


// Refresh logic
API.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    // if unauthorized & not already retried
    if (error.response?.status === 401 && !originalRequest._retry &&
      !originalRequest.url.includes("/auth/refresh")) {

      if (isRefreshing) {
        return new Promise((resolve) => {
          addSubscriber((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(API(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");

        authStore.setSessionStatus("refreshing");

        const res = await axios.post(
          `http://${window.location.hostname}:5000/api/auth/refresh`,
          { refreshToken }
        );

        localStorage.setItem("accessToken", res.data.accessToken);
        localStorage.setItem("refreshToken", res.data.refreshToken);

        authStore.setSessionStatus("authenticated");

        onRefreshed(res.data.accessToken);

        originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;

        return API(originalRequest);

      } catch (err) {
        authStore.setSessionStatus("failed");

        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        const clientUrl = window.location.origin;
        const alreadyTried = sessionStorage.getItem("oauth_retry");

        if (!alreadyTried) {
          sessionStorage.setItem("oauth_retry", "true");

          window.location.href = `http://${window.location.hostname}:5000/api/auth/google?clientUrl=${clientUrl}`;
        }

        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
  }
);

export default API;