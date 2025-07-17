import express from "express";
const router = express.Router();
import { getSchools } from "../controllers/schoolController.js";
import { protect, restrictTo } from "../middleware/authMiddleware.js";

// Only HQ can access schools list
router.route("/").get(protect, restrictTo("headquarter"), getSchools);

export default router;
