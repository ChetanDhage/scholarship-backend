import User from "../models/User.js";
import StudentData from "../models/Student_data.js";
import MonthlyData from "../models/Monthly_data.js";
import StudentAnswer from "../models/StudentAnswer.js";
import SubmissionStatus from "../models/SubmissionStatus.js";

export const getSubmissionStatus = async (req, res) => {
  try {
    const { schoolName, month, year } = req.query;
    const requestingUser = req.user;

    // Authorization check
    if (
      requestingUser.role !== "headquarter" &&
      requestingUser.schoolName !== schoolName
    ) {
      return res.status(403).json({
        status: "error",
        message: "Unauthorized access to school data",
      });
    }

    const validMonths = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    if (!validMonths.includes(month)) {
      return res
        .status(400)
        .json({ status: "error", message: "Valid month required" });
    }

    if (!/^\d{4}$/.test(year)) {
      return res
        .status(400)
        .json({ status: "error", message: "Valid year required" });
    }

    // Get total active students count
    const totalStudentsCount = await StudentData.countDocuments({
      schoolName,
    });

    const classes = ["5", "6", "7", "8", "9", "10"];
    const sections = ["A", "B", "C", "D", "E"];
    const results = [];
    const monthYearKey = `${month}-${year}`;

    for (const cls of classes) {
      for (const section of sections) {
        try {
          // Get all students in this section
          const students = await StudentData.find({
            schoolName,
            studentClass: cls,
            section,
          }).lean();

          const sectionTotal = students.length;
          let completedStudents = 0;
          const studentIds = students.map((s) => s._id);

          if (sectionTotal > 0) {
            // Get students with both marks and answer sheets using Promise.all
            const [studentsWithMarks, studentsWithAnswers] = await Promise.all([
              MonthlyData.find({
                studentId: { $in: studentIds },
                [`marks.${monthYearKey}`]: { $exists: true },
              }).distinct("studentId"),

              StudentAnswer.find({
                studentId: { $in: studentIds },
                month,
                year,
                status: { $in: ["saved", "checked", "published"] },
              }).distinct("studentId"),
            ]);

            // Convert to Sets for faster lookup
            const marksSet = new Set(
              studentsWithMarks.map((id) => id.toString())
            );
            const answersSet = new Set(
              studentsWithAnswers.map((id) => id.toString())
            );

            // Count students present in both sets
            completedStudents = studentIds.filter(
              (id) =>
                marksSet.has(id.toString()) && answersSet.has(id.toString())
            ).length;
          }

          // Determine status and reason
          let status = "pending";
          let reason = "No submissions yet";

          if (sectionTotal === 0) {
            status = "no students";
            reason = "No students in this section";
          } else if (completedStudents === sectionTotal) {
            status = "completed";
            reason = "All students have both marks and answer sheets";
          } else if (completedStudents > 0) {
            status = "incomplete";
            const missing = sectionTotal - completedStudents;
            reason = `${missing} students missing submissions`;
          }

          results.push({
            classSection: `Class ${cls} - Section ${section}`,
            submission: `${completedStudents}/${sectionTotal}`,
            totalStudents: sectionTotal,
            status,
            reason,
          });
        } catch (err) {
          console.error(
            `Error processing Class ${cls} Section ${section}:`,
            err
          );
          results.push({
            classSection: `Class ${cls} - Section ${section}`,
            submission: "0/0",
            totalStudents: 0,
            status: "error",
            reason: "Error checking status",
          });
        }
      }
    }

    res.status(200).json({
      status: "success",
      totalStudents: totalStudentsCount,
      data: results,
      message: "Submission status retrieved successfully",
    });
  } catch (error) {
    console.error("Error in getSubmissionStatus:", error);
    res.status(500).json({
      status: "error",
      message: "Server error while fetching submission status",
      error: error.message,
    });
  }
};
export const getRegisteredSchools = async (req, res) => {
  try {
    // Get unique school names from teachers with non-empty school names
    const schools = await User.aggregate([
      {
        $match: {
          role: "teacher",
          schoolName: { $exists: true, $ne: "" },
        },
      },
      {
        $group: {
          _id: "$schoolName",
        },
      },
      {
        $project: {
          _id: 0,
          name: "$_id",
        },
      },
    ]);

    // Extract just the school names
    const schoolNames = schools.map((s) => s.name).filter(Boolean);

    res.status(200).json({
      status: "success",
      data: schoolNames,
      message: "Schools retrieved successfully",
    });
  } catch (error) {
    console.error("Error fetching schools:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch registered schools",
      error: error.message,
    });
  }
};
