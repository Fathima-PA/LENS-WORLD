import User from "../../models/userModel.js";
import { generateReferralCode } from "../../utils/generateReferralCode.js";
import { generateAccessToken, generateRefreshToken } from "../../utils/token.js";



export const registerUserService = async (data) => {

  const { username, email, password, phone, referralCode } = data;

  if (!username || !email || !password || !phone) {
    throw Object.assign(
      new Error("All fields are required"),
      { statusCode: 400 }
    );
  }

  const normalizedEmail = email.toLowerCase().trim();

  const existingUser = await User.findOne({ email: normalizedEmail });

  if (existingUser) {
    throw Object.assign(
      new Error("User already exists"),
      { statusCode: 400 }
    );
  }

  const newReferralCode = generateReferralCode(username);

  const user = await User.create({
    username,
    email: normalizedEmail,
    password,
    phone,
    isVerified: true,
    referralCode: newReferralCode
  });

  if (referralCode) {

    const referrer = await User.findOne({ referralCode });

    if (referrer) {

      user.referredBy = referrer._id;

      referrer.wallet += 100;

      referrer.walletHistory.push({
        type: "CREDIT",
        amount: 100,
        reason: "Referral Reward"
      });

      await referrer.save();

      user.wallet += 50;

      user.walletHistory.push({
        type: "CREDIT",
        amount: 50,
        reason: "Signup Referral Bonus"
      });
    }
  }

  await user.save();

  return {
    message: "Registration completed successfully",
    user,
  };
};


export const loginUserService = async (data) => {

  const { email, password } = data;

  if (!email || !password) {
    throw Object.assign(
      new Error("Email and password are required"),
      { statusCode: 400 }
    );
  }

  const user = await User.findOne({
    email: email.toLowerCase().trim()
  });

  if (!user) {
    throw Object.assign(
      new Error("Invalid email or password"),
      { statusCode: 401 }
    );
  }

  if (user.isAdmin) {
    throw Object.assign(
      new Error("Admin cannot login from user login. Please login from Admin panel."),
      { statusCode: 403 }
    );
  }

  if (user.isBlocked) {
    throw Object.assign(
      new Error("Your account is blocked"),
      { statusCode: 403 }
    );
  }

  const isMatch = await user.matchPassword(password.trim());

  if (!isMatch) {
    throw Object.assign(
      new Error("Invalid email or password"),
      { statusCode: 401 }
    );
  }

  if (!user.isVerified) {
    throw Object.assign(
      new Error("Please verify your email first"),
      { statusCode: 403 }
    );
  }

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save();

  return {
    accessToken,
    refreshToken,
    user: {
      _id: user._id,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
      phone: user.phone,
      profileImage: user.profileImage,
    },
    message: "Login successful"
  };
};


export const updateProfileService = async (userId, data) => {

  const { name, phone } = data;

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      username: name,
      phone: phone,
    },
    { new: true }
  );

  if (!updatedUser) {
    throw Object.assign(
      new Error("User not found"),
      { statusCode: 404 }
    );
  }

  return updatedUser;
};


export const setPendingEmailService = async (userId, data) => {

  const { newEmail } = data;

  if (!newEmail) {
    throw Object.assign(
      new Error("New email is required"),
      { statusCode: 400 }
    );
  }

  const normalizedEmail = newEmail.toLowerCase().trim();

  const emailExists = await User.findOne({ email: normalizedEmail });

  if (emailExists) {
    throw Object.assign(
      new Error("Email already in use"),
      { statusCode: 400 }
    );
  }

  const user = await User.findById(userId);

  if (!user) {
    throw Object.assign(
      new Error("User not found"),
      { statusCode: 404 }
    );
  }

  user.pendingEmail = normalizedEmail;

  await user.save();

  return { message: "Pending email saved successfully" };
};


export const confirmEmailChangeService = async (userId) => {

  const user = await User.findById(userId);

  if (!user) {
    throw Object.assign(
      new Error("User not found"),
      { statusCode: 404 }
    );
  }

  if (!user.pendingEmail) {
    throw Object.assign(
      new Error("No pending email found"),
      { statusCode: 400 }
    );
  }

  user.email = user.pendingEmail;
  user.pendingEmail = undefined;

  await user.save();

  return {
    message: "Email updated successfully",
    user: {
      _id: user._id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      isAdmin: user.isAdmin,
      profileImage: user.profileImage,
    },
  };
};


export const changePasswordService = async (userId, data) => {

  const { currentPassword, newPassword } = data;

  if (!currentPassword || !newPassword) {
    throw Object.assign(
      new Error("Missing fields"),
      { statusCode: 400 }
    );
  }

  const user = await User.findById(userId);

  if (!user) {
    throw Object.assign(
      new Error("User not found"),
      { statusCode: 404 }
    );
  }

  const isMatch = await user.matchPassword(currentPassword.trim());

  if (!isMatch) {
    throw Object.assign(
      new Error("Current password is incorrect"),
      { statusCode: 400 }
    );
  }

  user.password = newPassword.trim();

  await user.save();

  return { message: "Password changed successfully" };
};



export const updateProfilePhotoService = async (userId, file) => {

  const user = await User.findById(userId);

  if (!user) {
    throw Object.assign(
      new Error("User not found"),
      { statusCode: 404 }
    );
  }

  const imageUrl = file?.path;

  if (!imageUrl) {
    throw Object.assign(
      new Error("No file uploaded"),
      { statusCode: 400 }
    );
  }

  user.profileImage = imageUrl;

  await user.save();

  return {
    message: "Profile photo updated successfully",
    profileImage: user.profileImage,
  };
};