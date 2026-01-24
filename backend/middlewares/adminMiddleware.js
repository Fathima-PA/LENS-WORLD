import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

export const protectAdmin = async (req, res, next) => {
  try {
    // ✅ read token from cookie
    const token = req.cookies.adminToken;

    if (!token) {
      return res.status(401).json({ message: "No admin token" });
    }

    // ✅ verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user || !user.isAdmin) {
      return res.status(403).json({ message: "Not authorized as admin" });
    }

    // ✅ attach admin user
    req.user = user;   // use req.user (standard)
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token invalid" });
  }
};
