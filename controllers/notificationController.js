import Notification from "../models/Notification.js";
import User from "../models/User.js";
import { getIO } from "../socket.js";

export const getNotifications = async (req, res) => {
  try {
    const { school } = req.query;
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Not authenticated",
      });
    }

    if (user.role !== "headquarter" && user.schoolName !== school) {
      return res.status(403).json({
        status: "error",
        message: "Unauthorized access to notifications",
      });
    }

    const query = {
      school: user.role === "headquarter" ? school : user.schoolName,
    };

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      status: "success",
      data: notifications,
      message: "Notifications retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({
      status: "error",
      message: "Server error while fetching notifications",
      error: error.message,
    });
  }
};

export const createNotification = async (req, res) => {
  try {
    const { title, message, type, school } = req.body;
    const user = req.user;

    if (!title || !message) {
      return res.status(400).json({
        status: "error",
        message: "Title and message are required fields",
      });
    }

    if (user.role === "headquarter" && !school) {
      return res.status(400).json({
        status: "error",
        message: "School selection is required for headquarters",
      });
    }

    const targetSchool = user.role === "headquarter" ? school : user.schoolName;
    
    const newNotification = await Notification.create({
      title,
      message,
      type,
      school: targetSchool,
      createdBy: user._id,
    });

    // Emit real-time event to all connected clients in the school room
    const io = getIO();
    io.to(targetSchool).emit('new-notification', newNotification);

    res.status(201).json({
      status: "success",
      data: newNotification,
      message: "Notification created successfully",
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to create notification",
      error: error.message,
    });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        status: "error",
        message: "Notification not found",
      });
    }

    if (
      req.user.role !== "headquarter" &&
      notification.school !== req.user.schoolName
    ) {
      return res.status(403).json({
        status: "error",
        message: "Unauthorized to delete this notification",
      });
    }

    await Notification.findByIdAndDelete(req.params.id);

    // Emit real-time deletion event
    const io = getIO();
    io.to(notification.school).emit('delete-notification', req.params.id);

    res.status(200).json({
      status: "success",
      message: "Notification deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to delete notification",
      error: error.message,
    });
  }
};