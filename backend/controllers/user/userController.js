import User from "../../models/userModel.js";
import { generateAccessToken, generateRefreshToken } from "../../utils/token.js";

//  REGISTER
export const registerUser = async (req, res) => {
  try {
    const { username, email, phone, password } = req.body;

    if (!username || !email || !phone || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const userExists = await User.findOne({ email: normalizedEmail });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      username,
      email: normalizedEmail,
      phone,
      password,
      isVerified: false,
      authProvider: "local",
    });

    res.status(201).json({
      message: "Signup successful. Please verify OTP",
      userId: user._id,
    });
  } catch (error) {
    console.error("REGISTER ERROR 👉", error);
    res.status(500).json({ message: error.message });
  }
};

//  LOGIN 
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    if (user.isAdmin) {
  return res.status(403).json({
    message: "Admin cannot login from user login. Please login from Admin panel.",
  });
}

    if (user.isBlocked) {
      return res.status(403).json({ message: "Your account is blocked" });
    }

    const isMatch = await user.matchPassword(password.trim());
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.isVerified) {
      return res
        .status(403)
        .json({ message: "Please verify your email first" });
    }

    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    // ✅ store refresh token in DB
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


    res.json({
      message: "Login successful",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
        phone: user.phone,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR 👉", error);
    res.status(500).json({ message: error.message });
  }
};

//  UPDATE PROFILE
export const updateProfile = async (req, res) => {
  try {
    const { name, phone } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        username: name,
        phone: phone,
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  SAVE PENDING EMAIL
export const setPendingEmail = async (req, res) => {
  try {
    const { newEmail } = req.body;

    if (!newEmail) {
      return res.status(400).json({ message: "New email is required" });
    }

    const normalizedEmail = newEmail.toLowerCase().trim();

    const emailExists = await User.findOne({ email: normalizedEmail });
    if (emailExists) {
      return res.status(400).json({ message: "Email already in use" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.pendingEmail = normalizedEmail;
    await user.save();

    res.json({ message: "Pending email saved successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  CONFIRM EMAIL CHANGE
export const confirmEmailChange = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.pendingEmail) {
      return res.status(400).json({ message: "No pending email found" });
    }

    user.email = user.pendingEmail;
    user.pendingEmail = undefined;

    await user.save();

    res.json({
      message: "Email updated successfully",
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
    res.status(500).json({ message: error.message });
  }
};

//  CHANGE PASSWORD
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await user.matchPassword(currentPassword.trim());
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    user.password = newPassword.trim();
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//  UPDATE PROFILE PHOTO
export const updateProfilePhoto = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) return res.status(404).json({ message: "User not found" });

    const imageUrl = req.file?.path;

    if (!imageUrl) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    user.profileImage = imageUrl;
    await user.save();

    res.json({
      message: "Profile photo updated successfully",
      profileImage: user.profileImage,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// GET LOGGED IN USER 
export const getMe = async (req, res) => {
  res.status(200).json(req.user);
};


