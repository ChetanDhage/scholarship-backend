import StudentData from "../models/Student_data.js";
import MonthlyData from "../models/Monthly_data.js";

export const getStudentsForMonthlyData = async (req, res) => {
  try {
    const { studentClass, section } = req.query;
    const schoolName = req.user.schoolName;

    if (!studentClass || !section) {
      return res.status(400).json({ error: "Class and section are required" });
    }

    const students = await StudentData.find({
      studentClass,
      section,
      schoolName,
    }).select("fullName rollNo studentClass section _id");

    res.status(200).json({
      students,
      total: students.length,
    });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

export const updateMonthlyMarks = async (req, res) => {
  try {
    const {
      marks,
      class: studentClass,
      section,
      monthYear,
      schoolName,
    } = req.body;

    const classQuery = {
      studentClass,
      section,
      schoolName,
    };

    const studentsExist = await StudentData.exists(classQuery);

    if (!studentsExist) {
      const availableClasses = await StudentData.distinct("studentClass", {
        schoolName,
      });
      const availableSections = await StudentData.distinct("section", {
        studentClass,
        schoolName,
      });

      return res.status(404).json({
        success: false,
        error: `No students found in ${studentClass}-${section}`,
        diagnostic: {
          availableClasses:
            availableClasses.length > 0
              ? availableClasses
              : ["No classes found"],
          availableSections:
            availableSections.length > 0
              ? availableSections
              : ["No sections found"],
        },
      });
    }

    const students = await StudentData.find(classQuery).select(
      "_id rollNo fullName studentClass section"
    );

    const bulkOps = students.map((student) => ({
      updateOne: {
        filter: {
          rollNo: student.rollNo,
          studentClass,
          section,
          schoolName,
          [`marks.${monthYear}`]: { $exists: false },
        },
        update: {
          $set: {
            studentId: student._id,
            studentName: student.fullName,
            studentClass,
            section,
            schoolName,
            [`marks.${monthYear}`]: marks[student.rollNo] || 0,
            lastUpdated: new Date(),
          },
        },
        upsert: true,
      },
    }));

    const result = await MonthlyData.bulkWrite(bulkOps);

    res.status(200).json({
      success: true,
      message: "Marks saved successfully",
      data: {
        savedCount: result.upsertedCount + result.modifiedCount,
        totalStudents: students.length,
      },
    });
  } catch (error) {
    console.error("Error saving marks:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};
