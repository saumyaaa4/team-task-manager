import express from "express";
import { createProject, getProjects } from "../controllers/projectController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Admin creates project
router.post("/", protect, authorize("admin"), createProject);

// Get projects
router.get("/", protect, getProjects);

export default router;