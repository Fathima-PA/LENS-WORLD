import api from "../../../api";

const API_URL = "/api/users";
const AUTH_URL = "/api/auth";

// REGISTER USER + SEND OTP 
const register = async (userData) => {
  const response = await api.post(`${API_URL}/register`, userData);

  await api.post(`${AUTH_URL}/send-otp`, {
    email: userData.email,
    purpose: "VERIFY_EMAIL",
  });

  return response.data;
};

//  LOGIN USER ✅
const login = async (userData) => {
  const response = await api.post(`${API_URL}/login`, userData);
  return response.data;
};

//  GET LOGGED USER ✅
const getMe = async () => {
  const response = await api.get(`${API_URL}/me`);
  return response.data;
};

//  UPDATE PROFILE ✅
const updateProfile = async (data) => {
  const response = await api.put(`${API_URL}/update-profile`, data);
  return response.data;
};

//  CHANGE PASSWORD ✅
const changePassword = async (data) => {
  const response = await api.put(`${API_URL}/change-password`, data);
  return response.data;
};

//  LOGOUT ✅
const logout = async () => {
  await api.post(`${AUTH_URL}/logout`);
};

const authService = {
  register,
  login,
  getMe,
  updateProfile,
  logout,
  changePassword,
};

export default authService;
