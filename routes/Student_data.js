// import express from "express";
// import {
//   createStudent,
//   getStudentsBySchool,
// } from "../controllers/Student_data.js"; // Import getStudentsBySchool
// import { protect } from "../middleware/authMiddleware.js"; // Import protect middleware
// import upload from "../middleware/uploadMiddleware.js"; // Import upload middleware

// const router = express.Router();

// // Apply protect middleware to the routes
// router.post("/", protect, upload.single("image"), createStudent); // Route for creating a student
// router.get("/", protect, getStudentsBySchool); // Route for fetching students

// export default router;

import express from "express";
import { studentImageUpload } from "../middleware/uploadMiddleware.js";
import {
  createStudent,
  getStudentsBySchool,
} from "../controllers/Student_data.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, studentImageUpload, createStudent);
router.get("/", protect, getStudentsBySchool);

export default router;