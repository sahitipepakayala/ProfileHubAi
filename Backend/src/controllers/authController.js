const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Company = require("../models/Company");
const Candidate = require("../models/Candidate");

// Helper: generate a JWT token
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// @desc Register a new company or candidate
// @route POST /api/auth/signup
const signup = async (req, res) => {
  try {
    const { role, email, password, ...otherFields } = req.body;

    if (!role || !["company", "candidate"].includes(role)) {
      return res.status(400).json({ message: "Valid role is required: 'company' or 'candidate'" });
    }

    const Model = role === "company" ? Company : Candidate;

    const existingUser = await Model.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await Model.create({
      email,
      password: hashedPassword,
      ...otherFields,
    });

    const token = generateToken(newUser._id, role);

    res.status(201).json({
      message: "Signup successful",
      token,
      user: { id: newUser._id, email: newUser.email, role },
    });
  } catch (error) {
    res.status(500).json({ message: "Signup failed", error: error.message });
  }
};

// @desc Login existing company or candidate
// @route POST /api/auth/login
const login = async (req, res) => {
  try {
    const { role, email, password } = req.body;

    if (!role || !["company", "candidate"].includes(role)) {
      return res.status(400).json({ message: "Valid role is required: 'company' or 'candidate'" });
    }

    const Model = role === "company" ? Company : Candidate;
    const user = await Model.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user._id, role);

    res.status(200).json({
      message: "Login successful",
      token,
      user: { id: user._id, email: user.email, role },
    });
  } catch (error) {
    res.status(500).json({ message: "Login failed", error: error.message });
  }
};

module.exports = { signup, login };