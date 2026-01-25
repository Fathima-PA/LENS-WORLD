import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

export const protect = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;

    if (!token) {
      return res.status(401).json({ message: "No token" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

   const user = await User.findById(decoded.id).select("-password");
    if (user.isBlocked) {
      return res.status(403).json({ message: "Your account is blocked" });
    }
 req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Access token expired" });
  }
};
