import { googleLoginService,
  sendOtpService, verifyOtpService,
  resetPasswordService,refreshAccessTokenService } from "../../services/user/authService.js";
import { STATUS_CODES } from "../../utils/statusCodes.js";

  //  GOOGLE LOGIN
export const googleLogin = async (req, res) => {
  try {

    const { user, accessToken, refreshToken } =
      await googleLoginService(req.body);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(STATUS_CODES.OK).json({
      message: "Google login success",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        isAdmin: user.isAdmin,
        profileImage: user.profileImage,
      },
    });

  } catch (error) {
    console.error("GOOGLE LOGIN ERROR ", error);

    res.status(error.statusCode || STATUS_CODES.SERVER_ERROR).json({
      message: error.message || "Google login failed"
    });
  }
};

 //  SEND OTP

export const sendOtp = async (req, res) => {
  try {

    const result = await sendOtpService(req.body, req.user);

    res.json(result);

  } catch (error) {

    console.error("SEND OTP ERROR:", error);

    res.status(error.statusCode || 500).json({
      message: error.message || "Failed to send OTP"
    });
  }
};

  //  VERIFY OTP

export const verifyOtp = async (req, res) => {
  try {

    const result = await verifyOtpService(req.body, req.user);

    res.json(result);

  } catch (error) {

    console.error("VERIFY OTP ERROR:", error);

    res.status(error.statusCode || 500).json({
      message: error.message || "OTP verification failed"
    });
  }
};

  //  RESET PASSWORD
export const resetPassword = async (req, res) => {
  try {

    const result = await resetPasswordService(req.body);

    res.json(result);

  } catch (error) {

    console.error("RESET PASSWORD ERROR:", error);

    res.status(error.statusCode || 500).json({
      message: error.message || "Reset password failed"
    });
  }
};

  //  REFRESH ACCESS TOKEN 

export const refreshAccessToken = async (req, res) => {
  try {

    console.log("🔁 Refresh API called");

    const { newAccessToken } =
      await refreshAccessTokenService(req.cookies.refreshToken);

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
      maxAge: 15 * 60 * 1000,
    });

    console.log("✅ New access token generated");

    return res.status(200).json({
      message: "Access token refreshed",
      accessToken: newAccessToken,
    });

  } catch (error) {

    console.log("❌ Refresh failed:", error.message);

    res.status(error.statusCode || 401).json({
      message: error.message || "Refresh token expired"
    });
  }
};
  //  LOGOUT 

export const logoutUser = async (req, res) => {
  try {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
