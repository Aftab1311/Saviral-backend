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
    // Check if user with the same email or phone number exists
    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
      return res.status(422).json({
        error: existingUser.email === email
          ? "User with this email already exists"
          : "User with this phone number already exists",
      });
    }

    // Create and save the new user
    const user = new User({ name, email, phone, password });
    const userResult = await user.save();

    if (userResult) {
      res.status(201).json({ message: "User registered successfully" });
    } else {
      res.status(400).json({ error: "Error registering user" });
    }
  } catch (error) {
    res.status(500).json({ error: "Server error during signup" });
  }
});

// Login route
router.post("/login", async (req, res) => {
  const { identifier, password } = req.body; // Use "identifier" instead of "email"

  try {
    // Check if identifier is an email or a phone number
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier); // Email regex
    const query = isEmail ? { email: identifier } : { phone: identifier }; // Query by email or phone

    const user = await User.findOne(query); // Find user by email or phone
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    // Check if the password is valid
    const isMatch = await user.isPasswordValid(password);
    if (!isMatch) {
      return res.status(400).json({ error: "Incorrect password" });
    }

    // Generate JWT token
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
