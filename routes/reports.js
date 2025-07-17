// report.js (Updated Routes)
import express from "express";
import {
  getSchools,
  getClasses,
  getReports,
  exportReportsCSV,
} from "../controllers/reportController.js";

const router = express.Router();

router.get("/schools", getSchools);
router.get("/classes", getClasses);
router.get("/", getReports);
router.get("/export", exportReportsCSV);

export default router;
