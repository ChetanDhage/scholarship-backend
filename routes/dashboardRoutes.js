import express from "express";
import {
  getDashboardStats,
  getTopStudents,
  getNotices,
  addNotice,
  deleteNotice,
} from "../controllers/dashboardController.js";
import {
  protect,
  teacherOnly,
  headquarterOnly,
} from "../middleware/authMiddleware.js";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = express.Router();

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF, JPEG, and PNG files are allowed"), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter,
});

router.get(
  "/stats",
  protect,
  (req, res, next) => {
    req.user.role === "headquarter" ? headquarterOnly(req, res, next) : next();
  },
  getDashboardStats
);

router.get("/top-students", protect, teacherOnly, getTopStudents);
router.get("/notices", protect, getNotices);
router.post(
  "/notices",
  protect,
  headquarterOnly,
  upload.single("file"),
  addNotice
);
router.delete("/notices/:id", protect, headquarterOnly, deleteNotice);

export default router;
