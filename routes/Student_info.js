import express from "express";
import {
  getStudentById,
  getAllStudents,
  createStudentInfo,
  updateStudent,
  deleteStudent,
} from "../controllers/Student_info.js";
import { protect } from "../middleware/authMiddleware.js"; // Import protect middleware

const router = express.Router();

// Use protect middleware to ensure only authenticated users can access these routes
router.get("/", protect, getAllStudents); // Get all students
router.get("/:id", protect, getStudentById); // Get a specific student by ID
router.post("/", protect, createStudentInfo); // Create a new student
router.put("/:id", protect, updateStudent); // Update a student
router.delete("/:id", protect, deleteStudent);
export default router;
