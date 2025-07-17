import express from "express";
import {
  getStudentsForMonthlyData, // Same export as controller
  updateMonthlyMarks, // Same export as controller
} from "../controllers/Monthly_data.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
const validateSchool = (req, res, next) => {
  const requestedSchool = req.query.schoolName;
  const userSchool = req.user.schoolName;

  if (requestedSchool && requestedSchool !== userSchool) {
    return res.status(403).json({ error: "Unauthorized school access" });
  }
  next();
};

// Routes use the exact same function names
router.get("/students", protect, validateSchool, getStudentsForMonthlyData);
router.put(
  "/update",
  protect,
  async (req, res, next) => {
    console.log("Incoming Update Request:", req.body); // ✅ Debugging log
    next();
  },
  updateMonthlyMarks
);

export default router;
