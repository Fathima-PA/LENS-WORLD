import User from "../../models/userModel.js";
import jwt from "jsonwebtoken";
import { paginate } from "../../utils/paginate.js";
import { buildQuery } from "../../utils/buildQuery.js";

export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const admin = await User.findOne({
      email: email.toLowerCase().trim(),
      isAdmin: true,
    });

    if (!admin) {
      return res.status(401).json({ message: "Admin not found" });
    }

    if (admin.isBlocked) {
      return res.status(403).json({ message: "Your account is blocked" });
    }

    const isMatch = await admin.matchPassword(password.trim());

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const adminToken = jwt.sign(
      { id: admin._id, isAdmin: admin.isAdmin },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("adminToken", adminToken, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.json({
      message: "Admin login successful ✅",
      admin: {
        _id: admin._id,
        username: admin.username,
        email: admin.email,
        isAdmin: admin.isAdmin,
      },
    });
  } catch (error) {
    console.log("ADMIN LOGIN ERROR 👉", error);
    res.status(500).json({ message: error.message });
  }
};

export const adminLogout = (req, res) => {
 
   res.clearCookie("adminToken");


  res.json({ message: "Admin logged out ✅" });
};


//  GET USERS 
export const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 5, search = "", status = "all" } = req.query;

    const query = buildQuery({
      search,
      searchFields: ["username", "email", "phone"],
      filters: {
        isBlocked:
          status === "active"
            ? false
            : status === "blocked"
            ? true
            : undefined,
      },
      baseQuery: { isAdmin: false },
    });

    const result = await paginate({
      model: User,
      query,
      page,
      limit,
    });

    res.json(result);
  } catch (error) {
    console.error("GET USERS ERROR 👉", error);
    res.status(500).json({ message: error.message });
  }
};


export const toggleBlockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isAdmin) {
      return res.status(403).json({ message: "Cannot block admin" });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.status(200).json({
      message: user.isBlocked ? "User blocked ✅" : "User unblocked ✅",
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



