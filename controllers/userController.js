import User from "../models/User.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";

export const updateUserProfile = async (req, res) => {
  try {
    const { username, email, password, schoolName, address, phone } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    // Update fields
    user.username = username || user.username;
    user.email = email || user.email;
    user.schoolName = schoolName || user.schoolName;
    user.address = address || user.address;
    user.phone = phone || user.phone;

    // Update password if provided
    if (password) {
      user.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await user.save();

    // Return updated data (excluding sensitive fields)
    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      schoolName: updatedUser.schoolName,
      address: updatedUser.address,
      phone: updatedUser.phone,
      role: updatedUser.role,
      profilePic: updatedUser.profilePic,
      token: generateToken(updatedUser._id),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
