import { adminLoginService,getUsersService,toggleBlockUserService} from "../../services/admin/adminAuthService.js";
import { STATUS_CODES } from "../../utils/statusCodes.js";

export const adminLogin = async (req, res) => {
  try {

    const { adminToken, admin } = await adminLoginService(req.body);

    res.cookie("adminToken", adminToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.json({
      message: "Admin login successful ",
      admin,
    });

  } catch (error) {
    console.log("ADMIN LOGIN ERROR ", error);

    res.status(error.status || STATUS_CODES.SERVER_ERROR).json({
      message: error.message || "Server error"
    });
  }
};

export const adminLogout = (req, res) => {
 
   res.clearCookie("adminToken");


  res.json({ message: "Admin logged out " });
};

// GET USERS
export const getUsers = async (req, res) => {
  try {

    const { page = 1, limit = 5, search = "", status = "all" } = req.query;

    const result = await getUsersService({
      page,
      limit,
      search,
      status,
    });

    res.json(result);

  } catch (error) {
    console.error("GET USERS ERROR ", error);

    res.status(STATUS_CODES.SERVER_ERROR).json({
      message: error.message || "Server error"
    });
  }
};

export const toggleBlockUser = async (req, res) => {
  try {

    const user = await toggleBlockUserService(req.params.id);

    res.status(STATUS_CODES.OK).json({
      message: user.isBlocked ? "User blocked " : "User unblocked ",
      user,
    });

  } catch (error) {
    res.status(error.status || STATUS_CODES.SERVER_ERROR).json({
      message: error.message || "Server error"
    });
  }
};



