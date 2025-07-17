import express from "express";
import {
  getNotifications,
  createNotification,
  deleteNotification,
} from "../controllers/notificationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router
  .route("/")
  .get(protect, getNotifications)
  .post(protect, createNotification);

router.route("/:id").delete(protect, deleteNotification);

export default router;
