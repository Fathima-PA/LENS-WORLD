import jwt from "jsonwebtoken";
import User from "../../models/userModel.js";
import sendEmail from "../../utils/sendEmail.js";
import { generateAccessToken, generateRefreshToken } from "../../utils/token.js";
import {setOtp} from "../../utils/setOtpForRegister.js"
import Otp from "../../models/Otp.js";


  //  GOOGLE LOGIN
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

    if (user.isBlocked) {
      return res.status(403).json({
        message: "Your account has been blocked by admin",
      });
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshToken = refreshToken;
    await user.save();

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

 //  SEND OTP
export const sendOtp = async (req, res) => {
  try {
    const { email, purpose, role } = req.body;

    if (!email || !purpose) {
      return res.status(400).json({ message: "Email or purpose missing" });
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
         console.log("REGISTER OTP EMAIL:",normalizedEmail);
      console.log(" REGISTER OTP:", otp);
    return res.json({ message: "OTP sent successfully" });
  }

    /* ---------- FORGOT PASSWORD ---------- */
    if (purpose === "FORGOT_PASSWORD") {
      user = await User.findOne(query);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const otp = await setOtp(user.email, purpose);
      await user.save();
      console.log(" OTP EMAIL:", user.email);
      console.log(" OTP:", otp);

      await sendEmail(user.email, otp);
      return res.json({ message: "OTP sent successfully" });
    }

    /* ---------- VERIFY NEW EMAIL ---------- */
    if (purpose === "VERIFY_NEW_EMAIL") {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      user = await User.findById(req.user._id);
      if (!user || !user.pendingEmail) {
        return res.status(400).json({ message: "No pending email found" });
      }

      const otp = await setOtp(user.pendingEmail, purpose);
      await user.save();
       console.log(" OTP EMAIL:", user.email);
      console.log(" OTP:", otp);

      await sendEmail(user.pendingEmail, otp);
      return res.json({ message: "OTP sent successfully" });
    }

    return res.status(400).json({ message: "Invalid OTP purpose" });

  } catch (error) {
    console.error("SEND OTP ERROR:", error);
    return res.status(500).json({ message: "Failed to send OTP" });
  }
};
 



  //  VERIFY OTP

export const verifyOtp = async (req, res) => {
  try {
    const { email, otp, purpose } = req.body;

    if (!otp || !purpose) {
      return res.status(400).json({ message: "OTP and purpose required" });
    }

    let user;

    /* ---------- REGISTER ---------- */
    if (purpose === "REGISTER") {
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const normalizedEmail = email.toLowerCase().trim();

      const otpRecord = await Otp.findOne({
        email: normalizedEmail,
        purpose,
      });

      if (!otpRecord) {
        return res.status(400).json({ message: "OTP expired or not found" });
      }

    if (otpRecord.expiresAt.getTime() < Date.now()) {
  await otpRecord.deleteOne();
  return res.status(400).json({ message: "OTP expired" });
}
      if (otpRecord.otp !== otp) {
        return res.status(400).json({ message: "Invalid OTP" });
      }

      await otpRecord.deleteOne();

      return res.json({ message: "OTP verified successfully" });
    }

    /* ---------- FORGOT PASSWORD ---------- */
    else if (purpose === "FORGOT_PASSWORD") {
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const normalizedEmail = email.toLowerCase().trim();
       const otpRecord = await Otp.findOne({
          email: normalizedEmail,
        purpose,
      });
      if (!otpRecord) {
        return res.status(400).json({ message: "OTP expired or not found" });
      }

    if (otpRecord.expiresAt.getTime() < Date.now()) {
  await otpRecord.deleteOne();
  return res.status(400).json({ message: "OTP expired" });
}


      if (otpRecord.otp !== otp) {
        return res.status(400).json({ message: "Invalid OTP" });
      }

      await otpRecord.deleteOne();

      return res.json({ message: "OTP verified successfully" });
      
    }

    /* ---------- VERIFY NEW EMAIL ---------- */
    else if (purpose === "VERIFY_NEW_EMAIL") {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
       const normalizedEmail = email.toLowerCase().trim();

      const otpRecord = await Otp.findOne({
        email: normalizedEmail,
        purpose,
      });

      if (!otpRecord) {
        return res.status(400).json({ message: "OTP expired or not found" });
      }

    if (otpRecord.expiresAt.getTime() < Date.now()) {
  await otpRecord.deleteOne();
  return res.status(400).json({ message: "OTP expired" });
}


      if (otpRecord.otp !== otp) {
        return res.status(400).json({ message: "Invalid OTP" });
      }

      await otpRecord.deleteOne();
    }

    else {
      return res.status(400).json({ message: "Invalid OTP purpose" });
    }

    return res.json({ message: "OTP verified successfully" });

  } catch (error) {
    console.error("VERIFY OTP ERROR:", error);
    return res.status(500).json({ message: "OTP verification failed" });
  }
};

  //  RESET PASSWORD

export const resetPassword = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Missing fields" });
    }

   const normalizedEmail = email.toLowerCase().trim();

let query = { email: normalizedEmail };

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



  //  REFRESH ACCESS TOKEN 

export const refreshAccessToken = async (req, res) => {
  try {
     console.log("🔁 Refresh API called"); 
    const refreshToken = req.cookies.refreshToken;

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
    res.status(401).json({ message: "Refresh token expired" });
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
