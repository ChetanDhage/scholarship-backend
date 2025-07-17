import StudentAnswer from "../models/StudentAnswer.js";
import StudentData from "../models/Student_data.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getStudentsForUpload = async (req, res) => {
  try {
    const { studentClass, section } = req.query;
    const schoolName = req.user.schoolName;

    if (!studentClass || !section) {
      return res.status(400).json({
        error: "Class and section are required",
        received: { studentClass, section },
      });
    }

    const students = await StudentData.find({
      studentClass,
      section,
      schoolName,
    }).select("fullName rollNo studentClass section _id");

    res.status(200).json({
      success: true,
      students,
      total: students.length,
    });
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({
      error: "Failed to load students",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

export const uploadAnswerSheet = async (req, res) => {
  try {
    // Validate required fields first
    const requiredFields = [
      "rollNo",
      "fullName",
      "className",
      "section",
      "month",
      "year",
      "schoolName",
    ];
    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0 || !req.file) {
      if (req.file) fs.unlinkSync(req.file.path);
      return res.status(400).json({
        error: "Missing required fields",
        missingFields: [...missingFields, ...(!req.file ? ["file"] : [])],
      });
    }

    // Verify student exists
    const student = await StudentData.findOne({
      rollNo: req.body.rollNo,
      studentClass: req.body.className,
      section: req.body.section,
      schoolName: req.body.schoolName,
    });

    if (!student) {
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: "Student not found" });
    }

    // Prepare response data
    const responseData = {
      tempFile: `/temp/${req.file.filename}`,
      studentId: student._id,
      rollNo: student.rollNo,
      fullName: student.fullName,
      className: student.studentClass,
      section: student.section,
      month: req.body.month,
      year: req.body.year,
      schoolName: student.schoolName,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
    };

    res.status(200).json({
      success: true,
      message: "Answer sheet uploaded temporarily",
      data: responseData,
    });
  } catch (error) {
    if (req.file?.path) fs.unlinkSync(req.file.path);
    console.error("Upload error:", error);
    res.status(500).json({
      error: "Failed to upload answer sheet",
      ...(process.env.NODE_ENV === "development" && { details: error.message }),
    });
  }
};

export const saveAllAnswerSheets = async (req, res) => {
  try {
    // Validate all required fields at once
    const requiredFields = [
      "month",
      "year",
      "class",
      "section",
      "schoolName",
      "uploads",
    ];
    const missingFields = requiredFields.filter((field) => !req.body[field]);

    if (missingFields.length > 0) {
      return res.status(400).json({
        error: "Missing required fields",
        missingFields,
      });
    }

    const results = [];
    let savedCount = 0;

    // Process each upload in sequence (not parallel)
    for (const upload of req.body.uploads) {
      try {
        // Validate upload data
        const requiredUploadFields = [
          "tempFile",
          "rollNo",
          "studentId",
          "className",
          "section",
          "schoolName",
        ];
        const missingUploadFields = requiredUploadFields.filter(
          (field) => !upload[field]
        );

        if (missingUploadFields.length > 0) {
          throw new Error(`Missing fields: ${missingUploadFields.join(", ")}`);
        }

        // Construct absolute file paths
        const tempFilePath = path.join(
          __dirname,
          "../../uploads",
          upload.tempFile.startsWith("/")
            ? upload.tempFile.slice(1)
            : upload.tempFile
        );

        if (!fs.existsSync(tempFilePath)) {
          throw new Error(`Temporary file not found`);
        }

        // Check for existing answer sheet
        const existing = await StudentAnswer.findOne({
          rollNo: upload.rollNo,
          month: req.body.month,
          year: req.body.year,
          class: req.body.class,
          section: req.body.section,
          schoolName: req.body.schoolName,
        });

        if (existing) {
          fs.unlinkSync(tempFilePath);
          results.push({
            rollNo: upload.rollNo,
            status: "skipped",
            message: "Answer sheet already exists",
          });
          continue;
        }

        // Move to permanent location
        const permanentDir = path.join(
          __dirname,
          "../../uploads/answer_sheets"
        );
        if (!fs.existsSync(permanentDir)) {
          fs.mkdirSync(permanentDir, { recursive: true });
        }

        const permanentFileName = `ans_${upload.rollNo}_${req.body.month}_${
          req.body.year
        }${path.extname(upload.tempFile)}`;
        const permanentPath = path.join(permanentDir, permanentFileName);

        fs.renameSync(tempFilePath, permanentPath);

        // Create database record
        const answerSheet = new StudentAnswer({
          studentId: upload.studentId,
          rollNo: upload.rollNo,
          month: req.body.month,
          year: req.body.year,
          class: req.body.class,
          section: req.body.section,
          schoolName: req.body.schoolName,
          answerSheet: `/answer_sheets/${permanentFileName}`,
          status: "saved",
          metadata: {
            originalName: upload.originalName || "answer_sheet.pdf",
            size: upload.size || fs.statSync(permanentPath).size,
            mimetype: upload.mimetype || "application/pdf",
            uploadedAt: new Date(),
          },
        });

        await answerSheet.save();
        savedCount++;
        results.push({
          rollNo: upload.rollNo,
          status: "saved",
          fileUrl: `/answer_sheets/${permanentFileName}`,
        });
      } catch (error) {
        results.push({
          rollNo: upload.rollNo || "unknown",
          status: "error",
          message: error.message,
        });
      }
    }

    res.status(200).json({
      success: true,
      savedCount,
      failedCount: req.body.uploads.length - savedCount,
      results,
    });
  } catch (error) {
    console.error("Save all error:", error);
    res.status(500).json({
      error: "Failed to save answer sheets",
      ...(process.env.NODE_ENV === "development" && { details: error.message }),
    });
  }
};

export default {
  getStudentsForUpload,
  uploadAnswerSheet,
  saveAllAnswerSheets,
};
