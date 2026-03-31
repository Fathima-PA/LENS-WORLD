import axios from "axios";

const api = axios.create({
 baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});
// console.log("🔥 API FILE LOADED");
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // console.log("❌ Error intercepted:", error.response?.status);

    const publicRoutes = [
      "/api/users/login",
      "/api/users/register",
      "/api/auth/google",
    ];

    const publicApis = [
  "/api/products",
  "/api/categories",
  "/api/users/me",
];

    if (
  publicRoutes.some(route => originalRequest.url.includes(route)) ||
  publicApis.some(route => originalRequest.url.includes(route))
) {
  return Promise.reject(error);
}

    if (originalRequest.url.includes("/api/auth/refresh")) {
      return Promise.reject(error);
    }

    if (error.response?.status === 403) {
      // console.log("🚫 User blocked"); 

      localStorage.setItem(
        "blockedMsg",
        error.response?.data?.message || "Your account is blocked"
      );

      localStorage.removeItem("isLoggedIn");
      window.location.href = "/login";

      return Promise.reject(error);
    }

   if (error.response?.status === 401 && !originalRequest._retry) {


  if (
    publicApis.some(route => originalRequest.url.includes(route))
  ) {
    return Promise.reject(error);
  }

 
  if (!localStorage.getItem("isLoggedIn")) {
    return Promise.reject(error);
  }


  if (window.location.pathname === "/login") {
    return Promise.reject(error);
  }

  originalRequest._retry = true;

  try {
    const refreshRes = await api.get("/api/auth/refresh");

    if (refreshRes.status === 200) {
      return api(originalRequest);
    }

  } catch (err) {
    localStorage.removeItem("isLoggedIn");

    if (window.location.pathname !== "/login") {
      window.location.href = "/login";
    }

    return Promise.reject(err);
  }
}

    return Promise.reject(error);
  }
);


export default api;
