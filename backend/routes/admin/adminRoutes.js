import express from "express";
import { adminLogin,adminLogout,getUsers } from "../../controllers/admin/adminController.js";
import { protectAdmin } from "../../middlewares/adminMiddleware.js";
import { toggleBlockUser } from "../../controllers/admin/adminController.js";


const router = express.Router();

router.post("/login", adminLogin);
router.post("/logout", adminLogout);
router.get("/me", protectAdmin, (req, res) => {
  res.status(200).json(req.user); 
});

router.get("/users", protectAdmin, getUsers);

router.put("/block/:id", protectAdmin, toggleBlockUser);

export default router;
