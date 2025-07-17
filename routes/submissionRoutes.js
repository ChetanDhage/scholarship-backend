import express from "express";
import {
  getSubmissionStatus,
  getRegisteredSchools,
} from "../controllers/submissionController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/status", protect, getSubmissionStatus);
router.get("/schools", protect, getRegisteredSchools);

export default router;
