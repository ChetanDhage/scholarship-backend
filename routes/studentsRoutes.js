import express from "express";
import { deleteStudent } from "../controllers/students_Controller.js";

const router = express.Router();

// Route to delete a student by ID
router.delete("/:id", deleteStudent);

export default router;
