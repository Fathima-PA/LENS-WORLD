import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000", // ✅ backend
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

if (originalRequest.url.includes("/api/auth/refresh")) {
  return Promise.reject(error);
}


    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await api.get("/api/auth/refresh");
        return api(originalRequest);
      } catch (err) {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
