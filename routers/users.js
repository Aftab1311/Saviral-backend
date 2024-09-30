const express = require("express");
const router = express.Router();
const User = require("../models/user");
const jwt = require("jsonwebtoken");

// Secret key for JWT (should be in environment variables in production)
const JWT_SECRET = process.env.JWT_SECRET;

// Signup route
router.post("/signup", async (req, res) => {
  const { name, email, phone, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(422).json({ error: "User already exists" });
    }
    const user = new User({ name, email, phone, password });
    const userResult = await user.save();

    console.log(userResult);
    if (userResult) {
      res.status(201).json({ message: "User registered successfully" });
    } else {
      res.status(400).json({ error: "Error registering user" });
    }
  } catch (error) {
    res.status(500).json({ error });
  }
});

// Login route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const isMatch = await user.isPasswordValid(password);
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name, phone: user.phone },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ error: "Error logging in user" });
  }
});

module.exports = router;
