import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

// Routes
import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";

// Middleware
import { protect, authorize } from "./middleware/authMiddleware.js";

dotenv.config();

const app = express(); // ✅ ALWAYS FIRST

// ===== MIDDLEWARE =====
app.use(cors());
app.use(express.json());

// ===== ROUTES =====
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);

// ===== TEST ROUTES =====
app.get("/", (req, res) => {
  res.send("API Running...");
});

// Protected test route
app.get("/api/test", protect, authorize("admin"), (req, res) => {
  res.send("Admin access granted");
});

// ===== DATABASE + SERVER =====
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");

    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => console.log("DB Error:", err));