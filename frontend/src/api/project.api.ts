import API from "./axios";

export const getProjects = (type: "created" | "shared" | "starred") =>
  API.get(`/projects?type=${type}`);

export const createProject = (data: { name: string; stack: string }) =>
  API.post("/projects", data);


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

export const getProjectFiles = (projectId: string) =>
  API.get(`/projects/${projectId}/files`);

export const screenshotProject = (projectId: string, previewUrl: string) =>
  API.post(`/projects/${projectId}/screenshot`, { previewUrl });