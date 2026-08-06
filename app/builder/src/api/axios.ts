import axios from "axios";
import { authStore } from "@/authStore";
import { API_URL } from "@/config/env";

const API = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Refresh Queue System
let isRefreshing = false;

let refreshSubscribers: {
  resolve: () => void;
  reject: (err: unknown) => void;
}[] = [];

function onRefreshed() {
  refreshSubscribers.forEach(({ resolve }) => resolve());
  refreshSubscribers = [];
}

function onRefreshFailed(err: unknown) {
  refreshSubscribers.forEach(({ reject }) => reject(err));
  refreshSubscribers = [];
}

function addSubscriber(resolve: () => void, reject: (err: unknown) => void) {
  refreshSubscribers.push({ resolve, reject });
}




// Response Interceptor
API.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    // Safety guard
    if (!originalRequest) {
      return Promise.reject(error);
    }

    // Only handle 401 (except refresh endpoint)
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/refresh")
    ) {
      // If already refreshing → queue request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          addSubscriber(() => { resolve(API(originalRequest)) }, reject);
        });
      }

      // Start refresh flow
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        authStore.setSessionStatus("refreshing");

        await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          {
            withCredentials: true,
          }
        );



        // Resolve all queued requests
        onRefreshed();

        // Retry original request
        return API(originalRequest);

      } catch (err) {
        // Reject all queued requests
        onRefreshFailed(err);

        authStore.setSessionStatus("failed");

        // Prevent infinite OAuth loop
        const alreadyTried = sessionStorage.getItem("oauth_retry");

        if (!alreadyTried) {
          sessionStorage.setItem("oauth_retry", "true");

          const clientUrl = window.location.origin;

          // Silent OAuth fallback
          window.location.href =
            `${API_URL}/auth/google?clientUrl=${clientUrl}`;
        }

        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default API;
