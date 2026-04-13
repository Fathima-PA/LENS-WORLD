import User from "../../models/userModel.js";
import jwt from "jsonwebtoken";
import { paginate } from "../../utils/paginate.js";
import { buildQuery } from "../../utils/buildQuery.js";
import { STATUS_CODES } from "../../utils/statusCodes.js";

export const adminLoginService = async ({ email, password }) => {

  if (!email || !password) {
    throw {
      status: STATUS_CODES.BAD_REQUEST,
      message: "Email and password are required"
    };
  }

  const admin = await User.findOne({
    email: email.toLowerCase().trim(),
    isAdmin: true,
  });

  if (!admin) {
    throw {
      status: STATUS_CODES.UNAUTHORIZED,
      message: "Admin not found"
    };
  }

  if (admin.isBlocked) {
    throw {
      status: STATUS_CODES.FORBIDDEN,
      message: "Your account is blocked"
    };
  }

  const isMatch = await admin.matchPassword(password.trim());

  if (!isMatch) {
    throw {
      status: STATUS_CODES.UNAUTHORIZED,
      message: "Invalid password"
    };
  }

  const adminToken = jwt.sign(
    { id: admin._id, isAdmin: admin.isAdmin },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  return {
    adminToken,
    admin: {
      _id: admin._id,
      username: admin.username,
      email: admin.email,
      isAdmin: admin.isAdmin,
    }
  };
};


export const getUsersService = async ({ page, limit, search, status }) => {

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

  return result;
};

export const toggleBlockUserService = async (id) => {

  const user = await User.findById(id);

  if (!user) {
    throw {
      status: STATUS_CODES.NOT_FOUND,
      message: "User not found"
    };
  }

  if (user.isAdmin) {
    throw {
      status: STATUS_CODES.FORBIDDEN,
      message: "Cannot block admin"
    };
  }

  user.isBlocked = !user.isBlocked;
  await user.save();

  return user;
};