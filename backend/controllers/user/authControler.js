import jwt from "jsonwebtoken";
import User from "../../models/userModel.js";
import { setUserOtp } from "../../utils/generateOtp.js";
import sendEmail from "../../utils/sendEmail.js";
import { verifyOtpHelper } from "../../utils/verifyUserOtp.js";
import { generateAccessToken, generateRefreshToken } from "../../utils/token.js";

/* ======================
   GOOGLE LOGIN
====================== */
export const googleLogin = async (req, res) => {
  const { name, email, photo } = req.body;

  try {
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

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
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
    res.status(500).json({ message: "Google login failed" });
  }
};

/* ======================
   SEND OTP
====================== */
export const sendOtp = async (req, res) => {
  try {
    const { email, purpose, role } = req.body;

    if (!email || !purpose) {
      return res.status(400).json({ message: "Email or OTP purpose missing" });
    }

 const normalizedEmail = email.toLowerCase().trim();

let query = { email: normalizedEmail };

if (role === "admin") query.isAdmin = true;
if (role === "user") query.isAdmin = false;
const user = await User.findOne(query);

    if (!user) {
      return res.status(404).json({ message: `${role || "user"} not found` });
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: "Account is blocked" });
    }

    const otp = setUserOtp(user, purpose);
    await user.save();

    console.log("OTP:", otp);
    await sendEmail(normalizedEmail, otp);

    res.json({ message: "OTP generated successfully" });
  } catch (error) {
    console.error("SEND OTP ERROR:", error);
    res.status(500).json({ message: "Failed to generate OTP" });
  }
};

/* ======================
   VERIFY OTP
====================== */
export const verifyOtp = async (req, res) => {
  console.log("✅ /api/auth routes loaded");

  try {
    const { email, otp, purpose, role } = req.body;

    const normalizedEmail = email.toLowerCase().trim();

let query = { email: normalizedEmail };

// ✅ Only filter by isAdmin if role is given
if (role === "admin") query.isAdmin = true;
if (role === "user") query.isAdmin = false;
          
          
    const user = await User.findOne(query);
    

    const result = verifyOtpHelper(user, otp, purpose);

    if (!result.ok) {
      return res.status(result.status).json({ message: result.message });
    }

    if (purpose === "VERIFY_EMAIL") {
      user.isVerified = true;
    }

    user.otp = undefined;
    user.otpPurpose = undefined;
    user.otpExpires = undefined;

    await user.save();

    res.json({ message: "OTP verified successfully" });
  } catch (error) {
    res.status(500).json({ message: "OTP verification failed" });
  }
};


/* ======================
   RESET PASSWORD
====================== */
export const resetPassword = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }

   const normalizedEmail = email.toLowerCase().trim();

let query = { email: normalizedEmail };

// ✅ Only filter by isAdmin if role is given
if (role === "admin") query.isAdmin = true;
if (role === "user") query.isAdmin = false;


const user = await User.findOne(query);



    if (!user) {
      return res.status(404).json({ message: `${role || "user"} not found` });
    }

    user.password = password.trim();
    user.authProvider = "local";

    user.otp = undefined;
    user.otpPurpose = undefined;
    user.otpExpires = undefined;

    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);
    res.status(500).json({ message: "Reset password failed" });
  }
};


/* ======================
   REFRESH ACCESS TOKEN ✅
====================== */
export const refreshAccessToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
  console.log("✅ Refresh API called");
console.log("✅ Cookies received:", req.cookies);
console.log("✅ refreshToken:", req.cookies.refreshToken);

    if (!refreshToken) {
      return res.status(401).json({ message: "No refresh token" });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: "User not found" });

    if (user.refreshToken !== refreshToken) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

   const newAccessToken = generateAccessToken(user._id);

res.cookie("accessToken", newAccessToken, {
  httpOnly: true,
  secure: false,
 sameSite: "lax",
  maxAge: 15 * 60 * 1000,
});

return res.status(200).json({
  message: "Access token refreshed",
  accessToken: newAccessToken,
});

  } catch (error) {
    res.status(401).json({ message: "Refresh token expired" });
  }
};

/* ======================
   LOGOUT ✅
====================== */
export const logoutUser = async (req, res) => {
  try {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
