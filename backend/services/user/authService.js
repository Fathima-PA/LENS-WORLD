import User from "../../models/userModel.js";
import { generateAccessToken, generateRefreshToken } from "../../utils/token.js";
import sendEmail from "../../utils/sendEmail.js";
import { setOtp } from "../../utils/setOtpForRegister.js";
import Otp from "../../models/Otp.js";
import jwt from "jsonwebtoken";

export const googleLoginService = async (data) => {

  const { name, email, photo } = data;

  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      username: name,
      email,
      isVerified: true,
      authProvider: "google",
      profileImage: photo || "",
    });
  }

  if (user.isBlocked) {
    const error = new Error("Your account has been blocked by admin");
    error.statusCode = 403;
    throw error;
  }

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save();

  return {
    user,
    accessToken,
    refreshToken
  };
};


export const sendOtpService = async (data, currentUser) => {

  const { email, purpose, role } = data;

  if (!email || !purpose) {
    const error = new Error("Email or purpose missing");
    error.statusCode = 400;
    throw error;
  }

  const normalizedEmail = email.toLowerCase().trim();

  let query = { email: normalizedEmail };
  if (role === "admin") query.isAdmin = true;
  if (role === "user") query.isAdmin = false;

  let user;

  /* ---------- REGISTER ---------- */
  if (purpose === "REGISTER") {

    const otp = await setOtp(normalizedEmail, purpose);

    await sendEmail(normalizedEmail, otp);

    console.log("REGISTER OTP EMAIL:", normalizedEmail);
    console.log("REGISTER OTP:", otp);

    return { message: "OTP sent successfully" };
  }

  /* ---------- FORGOT PASSWORD ---------- */
  if (purpose === "FORGOT_PASSWORD") {

    user = await User.findOne(query);

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    const otp = await setOtp(user.email, purpose);

    await user.save();

    console.log("OTP EMAIL:", user.email);
    console.log("OTP:", otp);

    await sendEmail(user.email, otp);

    return { message: "OTP sent successfully" };
  }

  /* ---------- VERIFY NEW EMAIL ---------- */
  if (purpose === "VERIFY_NEW_EMAIL") {

    if (!currentUser) {
      const error = new Error("Unauthorized");
      error.statusCode = 401;
      throw error;
    }

    user = await User.findById(currentUser._id);

    if (!user || !user.pendingEmail) {
      const error = new Error("No pending email found");
      error.statusCode = 400;
      throw error;
    }

    const otp = await setOtp(user.pendingEmail, purpose);

    await user.save();

    console.log("OTP EMAIL:", user.email);
    console.log("OTP:", otp);

    await sendEmail(user.pendingEmail, otp);

    return { message: "OTP sent successfully" };
  }

  const error = new Error("Invalid OTP purpose");
  error.statusCode = 400;
  throw error;
};




export const verifyOtpService = async (data, currentUser) => {

  const { email, otp, purpose } = data;

  if (!otp || !purpose) {
    const error = new Error("OTP and purpose required");
    error.statusCode = 400;
    throw error;
  }

  let user;

  /* ---------- REGISTER ---------- */
  if (purpose === "REGISTER") {

    if (!email) {
      const error = new Error("Email is required");
      error.statusCode = 400;
      throw error;
    }

    const normalizedEmail = email.toLowerCase().trim();

    const otpRecord = await Otp.findOne({
      email: normalizedEmail,
      purpose,
    });

    if (!otpRecord) {
      const error = new Error("OTP expired or not found");
      error.statusCode = 400;
      throw error;
    }

    if (otpRecord.expiresAt.getTime() < Date.now()) {
      await otpRecord.deleteOne();
      const error = new Error("OTP expired");
      error.statusCode = 400;
      throw error;
    }

    if (otpRecord.otp !== otp) {
      const error = new Error("Invalid OTP");
      error.statusCode = 400;
      throw error;
    }

    await otpRecord.deleteOne();

    return { message: "OTP verified successfully" };
  }

  /* ---------- FORGOT PASSWORD ---------- */
  if (purpose === "FORGOT_PASSWORD") {

    if (!email) {
      const error = new Error("Email is required");
      error.statusCode = 400;
      throw error;
    }

    const normalizedEmail = email.toLowerCase().trim();

    const otpRecord = await Otp.findOne({
      email: normalizedEmail,
      purpose,
    });

    if (!otpRecord) {
      const error = new Error("OTP expired or not found");
      error.statusCode = 400;
      throw error;
    }

    if (otpRecord.expiresAt.getTime() < Date.now()) {
      await otpRecord.deleteOne();
      const error = new Error("OTP expired");
      error.statusCode = 400;
      throw error;
    }

    if (otpRecord.otp !== otp) {
      const error = new Error("Invalid OTP");
      error.statusCode = 400;
      throw error;
    }

    await otpRecord.deleteOne();

    return { message: "OTP verified successfully" };
  }

  /* ---------- VERIFY NEW EMAIL ---------- */
  if (purpose === "VERIFY_NEW_EMAIL") {

    if (!currentUser) {
      const error = new Error("Unauthorized");
      error.statusCode = 401;
      throw error;
    }

    user = await User.findById(currentUser._id);

    if (!user) {
      const error = new Error("User not found");
      error.statusCode = 404;
      throw error;
    }

    const normalizedEmail = email.toLowerCase().trim();

    const otpRecord = await Otp.findOne({
      email: normalizedEmail,
      purpose,
    });

    if (!otpRecord) {
      const error = new Error("OTP expired or not found");
      error.statusCode = 400;
      throw error;
    }

    if (otpRecord.expiresAt.getTime() < Date.now()) {
      await otpRecord.deleteOne();
      const error = new Error("OTP expired");
      error.statusCode = 400;
      throw error;
    }

    if (otpRecord.otp !== otp) {
      const error = new Error("Invalid OTP");
      error.statusCode = 400;
      throw error;
    }

    await otpRecord.deleteOne();

    return { message: "OTP verified successfully" };
  }

  const error = new Error("Invalid OTP purpose");
  error.statusCode = 400;
  throw error;
};



export const resetPasswordService = async (data) => {

  const { email, password, role } = data;

  if (!email || !password) {
    const error = new Error("Missing fields");
    error.statusCode = 400;
    throw error;
  }

  const normalizedEmail = email.toLowerCase().trim();

  let query = { email: normalizedEmail };

  if (role === "admin") query.isAdmin = true;
  if (role === "user") query.isAdmin = false;

  const user = await User.findOne(query);

  if (!user) {
    const error = new Error(`${role || "user"} not found`);
    error.statusCode = 404;
    throw error;
  }

  user.password = password.trim();
  user.authProvider = "local";

  user.otp = undefined;
  user.otpPurpose = undefined;
  user.otpExpires = undefined;

  await user.save();

  return { message: "Password reset successful" };
};






export const refreshAccessTokenService = async (refreshToken) => {

  if (!refreshToken) {
    const error = new Error("No refresh token");
    error.statusCode = 401;
    throw error;
  }

  const decoded = jwt.verify(
    refreshToken,
    process.env.JWT_REFRESH_SECRET
  );

  const user = await User.findById(decoded.id);

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 401;
    throw error;
  }

  if (user.refreshToken !== refreshToken) {
    const error = new Error("Invalid refresh token");
    error.statusCode = 401;
    throw error;
  }

  const newAccessToken = generateAccessToken(user._id);

  return { newAccessToken };
};