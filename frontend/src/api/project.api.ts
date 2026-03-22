import API from "./axios";

export const getProjects = () => API.get("/projects");

export const createProject = (data: { name: string; stack: string }) =>
  API.post("/projects", data);

// export const startProject = (id: string) =>
//   API.post(`/projects/${id}/start`);
export const startProject = async (projectId: string) => {
  const res = await API.post(`/projects/${projectId}/start`);
  return res.data;
};

export const updateFile = (projectId: string, data: any) =>
  API.put(`/files/${projectId}`, data);

export const stopProject = (id: string) =>
  API.post(`/projects/${id}/stop`);

export const getFiles = (projectId: string) =>
  API.get(`/files/${projectId}`);