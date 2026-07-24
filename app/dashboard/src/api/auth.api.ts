  import API from "./axios";

  export const register = (data: { email: string; password: string }) =>
    API.post("/auth/register", data);

  export const login = (data: { email: string; password: string }) =>
    API.post("/auth/login", data);

  export const refresh = (refreshToken: string) =>
    API.post("/auth/refresh", { refreshToken });

  export const logout = (refreshToken: string) =>
    API.post("/auth/logout", { refreshToken });

  export const getMe = () => API.get("/users/me");