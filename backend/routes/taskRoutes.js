import express from "express";
import { createTask, getTasks, updateTask, getDashboard } from "../controllers/taskController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router(); // ✅ FIRST

// Routes
router.post("/", protect, createTask);
router.get("/", protect, getTasks);
router.put("/:id", protect, updateTask);

// Dashboard route
router.get("/dashboard", protect, getDashboard);

export default router;