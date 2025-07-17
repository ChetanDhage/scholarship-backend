import express from "express";
import {
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
} from "../controllers/ViewStudentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// All routes are protected and use the same base path
router
  .route("/:id")
  .get(protect, getStudentById) // GET student
  .put(protect, updateStudent) // UPDATE student
  .delete(protect, deleteStudent); // DELETE student

router.get("/", protect, getStudents); // GET all students

export default router;
