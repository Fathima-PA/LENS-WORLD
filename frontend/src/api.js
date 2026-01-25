import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    const publicRoutes = [
      "/api/users/login",
      "/api/users/register",
      "/api/auth/send-otp",
      "/api/auth/verify-otp",
      "/api/auth/google",
    ];

    if (publicRoutes.some((route) => originalRequest.url.includes(route))) {
      return Promise.reject(error); 
    }

    if (originalRequest.url.includes("/api/auth/refresh")) {
      return Promise.reject(error);
    }
   if (error.response?.status === 403) {
  localStorage.setItem(
    "blockedMsg",
    error.response?.data?.message || "Your account is blocked"
  );

  localStorage.removeItem("isLoggedIn");
  window.location.href = "/login";

  return Promise.reject(error);
}

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        await api.get("/api/auth/refresh");
        return api(originalRequest);
      } catch (err) {
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);


export default api;
