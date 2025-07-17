import mongoose from "mongoose";
import DashboardStat from "../models/DashboardStat.js";
import User from "../models/User.js";
import StudentData from "../models/Student_data.js";
import MonthlyData from "../models/Monthly_data.js";
import StudentAnswer from "../models/StudentAnswer.js";
import Notice from "../models/Notice.js";
import fs from "fs";
import path from "path";

export const getDashboardStats = async (req, res) => {
  try {
    if (req.user.role === "headquarter") {
      const [totalSchools, totalStudents] = await Promise.all([
        User.countDocuments({ role: "teacher" }),
        StudentData.countDocuments(),
      ]);

      const approvedApplications = await StudentAnswer.aggregate([
        {
          $lookup: {
            from: "monthly_data",
            let: { studentId: "$studentId" },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ["$studentId", "$$studentId"] },
                },
              },
              {
                $project: {
                  hasMarks: {
                    $gt: [{ $size: { $objectToArray: "$marks" } }, 0],
                  },
                },
              },
            ],
            as: "marksData",
          },
        },
        { $match: { "marksData.hasMarks": true } },
        { $count: "count" },
      ]);

      const rejected = totalStudents - (approvedApplications[0]?.count || 0);

      const schoolsWithSubmissions = await User.aggregate([
        { $match: { role: "teacher" } },
        {
          $lookup: {
            from: "studentanswers",
            localField: "schoolName",
            foreignField: "schoolName",
            as: "submissions",
          },
        },
        { $match: { submissions: { $ne: [] } } },
        { $count: "count" },
      ]);

      const scholarshipPercentage =
        totalSchools > 0
          ? Math.round(
              ((schoolsWithSubmissions[0]?.count || 0) / totalSchools) * 100
            )
          : 0;

      return res.status(200).json({
        totalSchools,
        totalStudents,
        approvedApplications: approvedApplications[0]?.count || 0,
        rejectedApplications: rejected,
        scholarshipPercentage,
      });
    }

    const stats = await DashboardStat.find();
    res.status(200).json(stats);
  } catch (error) {
    console.error("Error fetching stats:", error);
    res.status(500).json({
      message: "Error fetching stats",
      error: error.message,
    });
  }
};

export const getTopStudents = async (req, res) => {
  try {
    const { role, schoolName } = req.user;
    if (role !== "teacher") {
      return res.status(200).json([]);
    }

    // 1) Decide which class to use:
    //    - If front-end sent ?class=5 (or 6,7...), use that string directly.
    //    - Otherwise fall back to the latest updated class.
    let targetClass = req.query.class || "";

    if (!targetClass) {
      const latest = await MonthlyData.findOne({ schoolName })
        .sort({ updatedAt: -1 })
        .select("studentClass")
        .lean();
      targetClass = latest?.studentClass?.toString() || "";
    }

    if (!targetClass) {
      // no class available → empty list
      return res.status(200).json([]);
    }

    // 2) Aggregate top 10 for that class
    const topStudents = await MonthlyData.aggregate([
      {
        $match: {
          schoolName,
          // studentClass is stored as a string in the docs,
          // so we match that directly against the string query param
          studentClass: targetClass,
        },
      },
      {
        // convert marks object into an array of {k, v}
        $addFields: {
          marksArray: { $objectToArray: "$marks" },
        },
      },
      // unwind so each subject-mark pair is its own doc
      { $unwind: "$marksArray" },
      // group by student, summing each mark value
      {
        $group: {
          _id: "$studentId",
          totalMarks: { $sum: "$marksArray.v" },
          studentClass: { $first: "$studentClass" },
          section: { $first: "$section" },
        },
      },
      // lookup the student’s fullName from StudentData
      {
        $lookup: {
          from: StudentData.collection.name,
          localField: "_id",
          foreignField: "_id",
          as: "student",
        },
      },
      { $unwind: "$student" },
      // project only the fields the front-end uses
      {
        $project: {
          _id: 0,
          fullName: "$student.fullName",
          studentClass: 1,
          section: 1,
          totalMarks: 1,
        },
      },
      // sort descending and limit to top 10
      { $sort: { totalMarks: -1 } },
      { $limit: 10 },
    ]);

    return res.status(200).json(topStudents);
  } catch (error) {
    console.error("Error in getTopStudents:", error);
    res.status(500).json({ message: error.message });
  }
};

export const getNotices = async (req, res) => {
  try {
    const notices = await Notice.find().sort({ createdAt: -1 });
    res.status(200).json(notices);
  } catch (error) {
    console.error("Error fetching notices:", error);
    res.status(500).json({
      message: "Error fetching notices",
      error: error.message,
    });
  }
};

export const addNotice = async (req, res) => {
  try {
    const noticeText = req.body.notice;
   const fileUrl = req.file
  ? `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`
  : null;


    if (!noticeText?.trim() && !fileUrl) {
      return res.status(400).json({
        message: "Notice text or file is required",
      });
    }

    const newNotice = new Notice({
      notice: noticeText?.trim() || "File Attachment",
      file: fileUrl || "",
    });

    await newNotice.save();

    res.status(201).json({
      message: "Notice added successfully",
      notice: newNotice,
    });
  } catch (error) {
    console.error("Notice creation error:", error);
    res.status(500).json({
      message: error.message.includes("validation failed")
        ? "Invalid notice data"
        : "Server error",
      error: error.message,
    });
  }
};

export const deleteNotice = async (req, res) => {
  try {
    if (req.user.role !== "headquarter") {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    const { id } = req.params;
    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid notice ID" });
    }

    const notice = await Notice.findById(id);
    if (!notice) {
      return res.status(404).json({ message: "Notice not found" });
    }

    if (notice.file) {
      const urlParts = notice.file.split("/");
      const filename = urlParts[urlParts.length - 1];
      const uploadDir = path.join(process.cwd(), "uploads");
      const filePath = path.join(uploadDir, filename);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await Notice.findByIdAndDelete(id);
    res.json({ message: "Notice deleted successfully" });
  } catch (error) {
    console.error("Error deleting notice:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};