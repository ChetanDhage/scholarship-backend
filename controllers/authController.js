import User from "../models/User.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";

// @desc Register User
// @route POST /api/auth/signup
export const signup = async (req, res) => {
  const { username, email, password, schoolName, address, role, phone } =
    req.body;

  if (
    !username ||
    !email ||
    !password ||
    !schoolName ||
    !address ||
    !role ||
    !phone
  ) {
    return res
      .status(400)
      .json({ message: "Please fill all required fields." });
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: "User already exists." });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    username,
    email,
    password: hashedPassword,
    schoolName,
    address,
    role,
    phone,
  });

  if (newUser) {
    res.status(201).json({
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      schoolName: newUser.schoolName,
      role: newUser.role, // Added role to response
      token: generateToken(newUser._id),
    });
  } else {
    res.status(400).json({ message: "Invalid user data" });
  }
};

// @desc Login User
// @route POST /api/auth/login
export const login = async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res
      .status(400)
      .json({ message: "Please fill all required fields." });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).json({ message: "User not found." });
  }

  // Check if role matches the user’s actual role
  if (user.role !== role) {
    return res.status(403).json({ message: "Unauthorized role selected." });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (isMatch) {
    res.json({
      success: true,
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      schoolName: user.schoolName,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: "Invalid credentials." });
  }
};


// @desc Get current user profile
// @route GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({
      ...user._doc,
      schoolName: user.schoolName, // Ensure schoolName is always included
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Server error" });
  }
};
