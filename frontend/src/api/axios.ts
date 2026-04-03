import axios from "axios";

const API = axios.create({
  baseURL: `http://${window.location.hostname}:5000/api`,
});

// 🔐 Attach access token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// 🔁 Refresh logic
API.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    // if unauthorized & not already retried
    if (error.response?.status === 401 && !originalRequest._retry &&
      !originalRequest.url.includes("/auth/refresh")) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");

        const res = await axios.post(
          `http://${window.location.hostname}:5000/api/auth/refresh`,
          { refreshToken }
        );

        // save new tokens
        localStorage.setItem("accessToken", res.data.accessToken);
        localStorage.setItem("refreshToken", res.data.refreshToken);

        // retry original request
        originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;

        return API(originalRequest);
      } catch (err) {
        // refresh failed → logout
        console.log(err);
        
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");

        // window.location.href = "/login";
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export default API;