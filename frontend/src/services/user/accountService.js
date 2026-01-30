import api from "../../api";

/* ================= PROFILE ================= */

export const updateProfile = (data) =>
  api.put("/api/users/update-profile", data);

export const uploadProfilePhoto = (formData) =>
  api.put("/api/users/update-photo", formData);

/* ================= EMAIL CHANGE ================= */

export const setPendingEmail = (newEmail) =>
  api.put("/api/users/set-pending-email", { newEmail });

export const sendEmailOtp = (newEmail) =>
  api.post("/api/auth/send-otp", {
    email: newEmail,
    purpose: "VERIFY_NEW_EMAIL",
  });

export const verifyEmailOtp = (otp, newEmail) =>
  api.post("/api/auth/verify-otp", {
    email: newEmail,
    otp,
    purpose: "VERIFY_NEW_EMAIL",
  });


export const confirmEmailChange = () =>
  api.put("/api/users/confirm-email-change");

/* ================= PASSWORD ================= */

export const changePassword = (data) =>
  api.put("/api/users/change-password", data);
