import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();


// =======================
// CORS FIX (IMPORTANT)
// =======================
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));


// =======================
// MIDDLEWARE
// =======================
app.use(express.json());


// =======================
// TEST ROUTE
// =======================
app.get("/", (req, res) => {
  res.send("Backend is working");
});


// =======================
// TEST ROUTE
// =======================
app.post("/test", (req, res) => {
  console.log("TEST BODY:", req.body);
  res.json({ received: req.body });
});


// =======================
// CONNECT MONGODB
// =======================
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => {
    console.log("MongoDB Error:", err);
    process.exit(1);
  });


// =======================
// JWT
// =======================
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};


// =======================
// REGISTER
// =======================
app.post("/api/auth/register", async (req, res) => {
  try {
    console.log("REGISTER BODY:", req.body);

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const usersCount = await User.countDocuments();
    const role = usersCount === 0 ? "admin" : "member";

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    return res.status(201).json({
      token: generateToken(user._id),
      user,
    });

  } catch (error) {
    console.log("REGISTER ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
});


// =======================
// LOGIN
// =======================
app.post("/api/auth/login", async (req, res) => {
  try {
    console.log("LOGIN BODY:", req.body);

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    return res.json({
      token: generateToken(user._id),
      user,
    });

  } catch (error) {
    console.log("LOGIN ERROR:", error);
    return res.status(500).json({ message: error.message });
  }
});


// =======================
// START SERVER
// =======================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});