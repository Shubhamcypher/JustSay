import API from "./axios";

export const register = (data: { email: string; password: string }) =>
  API.post("/auth/register", data);

export const login = (data: { email: string; password: string }) =>
  API.post("/auth/login", data);

export const refresh = () => API.post("/auth/refresh");

export const logout = () => API.post("/auth/logout");

export const getMe = () => API.get("/users/me");