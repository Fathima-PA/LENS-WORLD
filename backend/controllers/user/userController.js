import { registerUserService ,loginUserService,
  updateProfileService,setPendingEmailService,
  confirmEmailChangeService,changePasswordService,
  updateProfilePhotoService } from "../../services/user/userService.js";

//  REGISTER

export const registerUser = async (req, res) => {
  try {

    const result = await registerUserService(req.body);

    res.status(201).json(result);

  } catch (error) {

    console.error("REGISTER AFTER OTP ERROR:", error);

    res.status(error.statusCode || 500).json({
      message: error.message || "Registration failed"
    });

  }
};


//  LOGIN 

export const loginUser = async (req, res) => {
  try {

    const result = await loginUserService(req.body);

    res.cookie("accessToken", result.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      message: result.message,
      user: result.user
    });

  } catch (error) {

    console.error("LOGIN ERROR ", error);

    res.status(error.statusCode || 500).json({
      message: error.message
    });

  }
};

//  UPDATE PROFILE

export const updateProfile = async (req, res) => {
  try {

    const result = await updateProfileService(
      req.user._id,
      req.body
    );

    res.status(200).json(result);

  } catch (error) {

    res.status(error.statusCode || 500).json({
      message: error.message
    });

  }
};

//  SAVE PENDING EMAIL

export const setPendingEmail = async (req, res) => {
  console.log("set pending email");

  try {

    const result = await setPendingEmailService(
      req.user._id,
      req.body
    );

    res.json(result);

  } catch (error) {

    res.status(error.statusCode || 500).json({
      message: error.message
    });

  }
};

//  CONFIRM EMAIL CHANGE


export const confirmEmailChange = async (req, res) => {
  try {

    const result = await confirmEmailChangeService(req.user._id);

    res.json(result);

  } catch (error) {

    res.status(error.statusCode || 500).json({
      message: error.message
    });

  }
};

//  CHANGE PASSWORD

export const changePassword = async (req, res) => {
  try {

    const result = await changePasswordService(
      req.user._id,
      req.body
    );

    res.json(result);

  } catch (error) {

    res.status(error.statusCode || 500).json({
      message: error.message
    });

  }
};

//  UPDATE PROFILE PHOTO


export const updateProfilePhoto = async (req, res) => {
  try {

    const result = await updateProfilePhotoService(
      req.user._id,
      req.file
    );

    res.json(result);

  } catch (error) {

    res.status(error.statusCode || 500).json({
      message: error.message
    });

  }
};
// GET LOGGED IN USER 
export const getMe = async (req, res) => {
  try {
    res.set("Cache-Control", "no-store");
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized" });
    }
   const user = req.user.toObject();
    const { refreshToken, __v, ...safeUser } = user;

    return res.status(200).json(safeUser);

  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};

