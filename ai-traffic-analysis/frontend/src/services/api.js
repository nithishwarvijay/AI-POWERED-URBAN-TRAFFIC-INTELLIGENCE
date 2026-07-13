import axios from "axios";

const api = axios.create({ baseURL: "/api" });

export const uploadMedia = (file, onProgress) => {
  const form = new FormData();
  form.append("file", file);
  return api.post("/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (e) => onProgress && onProgress(Math.round((e.loaded * 100) / e.total)),
  });
};

export const analyzeTraffic = (file, onProgress) => {
  const form = new FormData();
  form.append("file", file);
  return api.post("/analyze-traffic", form, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (e) => onProgress && onProgress(Math.round((e.loaded * 100) / e.total)),
  });
};

export const getResults = (skip = 0, limit = 20) =>
  api.get("/results", { params: { skip, limit } });

export const getResult = (id) => api.get(`/results/${id}`);

export const getStats = () => api.get("/stats");

export default api;
