// export const verifyOtpHelper = (user, otp, purpose = null) => {
  
//   if (!user) {
//     return { ok: false, status: 404, message: "User not found" };
//   }

//   const cleanedOtp = otp?.toString().trim();

//   if (!cleanedOtp) {
//     return { ok: false, status: 400, message: "OTP is required" };
//   }

//   if (user.otp !== cleanedOtp) {
//     return { ok: false, status: 400, message: "Invalid OTP" };
//   }

//   if (purpose && user.otpPurpose !== purpose) {
//     return { ok: false, status: 400, message: "OTP purpose mismatch" };
//   }

//   if (user.otpExpires < Date.now()) {
//     return { ok: false, status: 400, message: "OTP expired" };
//   }

//   return { ok: true };
// };
