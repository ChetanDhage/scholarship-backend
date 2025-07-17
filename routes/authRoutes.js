import express from "express";
import { signup, login } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import {
  createStudent,
  getStudentsBySchool,
} from "../controllers/Student_data.js";
import {
  getStudentsForMonthlyData, // Must match controller export
  updateMonthlyMarks, // Must match controller export
} from "../controllers/Monthly_data.js";

const router = express.Router();

// Auth routes
router.post("/signup", signup);
router.post("/login", login);

// Student data routes
router.post("/student-data", protect, createStudent);
router.get("/student-data", protect, getStudentsBySchool);

// Monthly data routes (EXACT MATCH to controller exports)
router.get("/monthly-data/students", protect, getStudentsForMonthlyData);
router.put("/monthly-data/update", protect, updateMonthlyMarks);

export default router;
