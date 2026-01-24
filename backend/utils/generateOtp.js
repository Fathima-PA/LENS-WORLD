export const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// utils/generateOtp.js

export const setUserOtp = (user, purpose) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  user.otp = otp;
  user.otpPurpose = purpose;   // 🔴 THIS WAS MISSING
  user.otpExpires = Date.now() + 10 * 60 * 1000;

  return otp;
};


