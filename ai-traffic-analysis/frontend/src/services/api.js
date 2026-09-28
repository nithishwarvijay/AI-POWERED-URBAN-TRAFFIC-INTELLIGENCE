import axios from "axios";

const api = axios.create({ baseURL: "/api" });

// ── Auth interceptor: attach JWT to every request ──────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("intelliflow-token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor: handle 401 globally ──────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("intelliflow-token");
      localStorage.removeItem("intelliflow-user");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// ── Auth API ────────────────────────────────────────────────────────────────
export const authLogin = (email, password) =>
  api.post("/auth/login", { email, password });

export const authRegister = (data) =>
  api.post("/auth/register", data);

export const authDemoLogin = () =>
  api.post("/auth/demo-login");

export const authGetMe = () =>
  api.get("/auth/me");

export const authUpdateMe = (data) =>
  api.put("/auth/me", data);

export const authChangePassword = (currentPassword, newPassword) =>
  api.post("/auth/change-password", {
    current_password: currentPassword,
    new_password: newPassword,
  });

// ── User Management (Admin) ──────────────────────────────────────────────────
export const getUsers = (skip = 0, limit = 100) =>
  api.get("/auth/users", { params: { skip, limit } });

export const getUser = (id) =>
  api.get(`/auth/users/${id}`);

export const updateUser = (id, data) =>
  api.put(`/auth/users/${id}`, data);

export const deleteUser = (id) =>
  api.delete(`/auth/users/${id}`);

// ── Traffic Analysis API ─────────────────────────────────────────────────────
export const uploadMedia = (file, onProgress) => {
  const form = new FormData();
  form.append("file", file);
  return api.post("/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (e) =>
      onProgress && onProgress(Math.round((e.loaded * 100) / e.total)),
  });
};

export const analyzeTraffic = (file, onProgress) => {
  const form = new FormData();
  form.append("file", file);
  return api.post("/analyze-traffic", form, {
    headers: { "Content-Type": "multipart/form-data" },
    onUploadProgress: (e) =>
      onProgress && onProgress(Math.round((e.loaded * 100) / e.total)),
  });
};

export const getResults = (skip = 0, limit = 20) =>
  api.get("/results", { params: { skip, limit } });

export const getResult = (id) =>
  api.get(`/results/${id}`);

export const getStats = () =>
  api.get("/stats");

export const getApproachDensity = (resultId) =>
  api.get(`/density/${resultId}`);

export const getSignalDecisions = (limit = 10) =>
  api.get("/signal-decision", { params: { limit } });

export default api;
