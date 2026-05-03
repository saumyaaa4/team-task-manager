import express from "express";
import {
  register,
  login
} from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import User from "../models/User.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.get("/me", protect, async (req, res) => {

  const user = await User.findById(
    req.user._id
  ).select("-password");

  res.json({ user });

});

export default router;