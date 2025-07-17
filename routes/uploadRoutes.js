import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { answerSheetFileUpload } from "../middleware/uploadMiddleware.js";
import {
  getStudentsForUpload,
  uploadAnswerSheet,
  saveAllAnswerSheets,
} from "../controllers/uploadController.js";

const router = express.Router();

router.get("/students", protect, getStudentsForUpload);
router.post("/", protect, answerSheetFileUpload, uploadAnswerSheet);
router.post("/save-all", protect, saveAllAnswerSheets);

export default router;
