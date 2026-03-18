import API from "./axios";

export const getProjects = () => API.get("/projects");

export const createProject = (data: { name: string; stack: string }) =>
  API.post("/projects", data);

export const startProject = (id: string) =>
  API.post(`/projects/${id}/start`);

export const stopProject = (id: string) =>
  API.post(`/projects/${id}/stop`);

export const getFiles = (projectId: string) =>
  API.get(`/files/${projectId}`);// fixing the commiting issue!!