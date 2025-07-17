// reportController.js (Updated)
import mongoose from "mongoose";
import User from "../models/User.js";
import StudentData from "../models/Student_data.js";
import MonthlyData from "../models/Monthly_data.js";

export const getSchools = async (req, res) => {
  try {
    const schools = await User.distinct("schoolName", { role: "teacher" });
    res.status(200).json(schools);
  } catch (error) {
    res.status(500).json({ message: "Error fetching schools", error });
  }
};

export const getClasses = async (req, res) => {
  try {
    const { school } = req.query;
    const classes = await StudentData.distinct("studentClass", {
      schoolName: school,
    });
    res.status(200).json(classes);
  } catch (error) {
    res.status(500).json({ message: "Error fetching classes", error });
  }
};

const getReportData = async (school, className) => {
  return await StudentData.aggregate([
    {
      $match: {
        schoolName: school || { $exists: true },
        studentClass: className || { $exists: true },
      },
    },
    {
      $lookup: {
        from: "monthly_data",
        localField: "_id",
        foreignField: "studentId",
        as: "marksData",
      },
    },
    {
      $project: {
        schoolName: 1,
        studentClass: 1,
        passed: {
          $anyElementTrue: {
            $map: {
              input: "$marksData.marks",
              as: "markData",
              in: {
                $gt: [
                  {
                    $avg: {
                      $map: {
                        input: { $objectToArray: "$$markData" },
                        as: "subject",
                        in: "$$subject.v",
                      },
                    },
                  },
                  50,
                ],
              },
            },
          },
        },
      },
    },
    {
      $group: {
        _id: { school: "$schoolName", class: "$studentClass" },
        totalStudents: { $sum: 1 },
        passedStudents: { $sum: { $cond: ["$passed", 1, 0] } },
        failedStudents: { $sum: { $cond: ["$passed", 0, 1] } },
      },
    },
    {
      $project: {
        _id: 0,
        schoolName: "$_id.school",
        className: "$_id.class",
        totalStudents: 1,
        passedStudents: 1,
        failedStudents: 1,
      },
    },
  ]);
};

export const getReports = async (req, res) => {
  try {
    const { school, className } = req.query;
    const aggregation = await getReportData(school, className);
    res.status(200).json(aggregation);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
};

export const exportReportsCSV = async (req, res) => {
  try {
    const { school, className } = req.query;
    const aggregation = await getReportData(school, className);

    const csvContent = [
      "School Name,Class,Total Students,Passed Students,Failed Students",
      ...aggregation.map(
        (r) =>
          `${r.schoolName},${r.className},${r.totalStudents},${r.passedStudents},${r.failedStudents}`
      ),
    ].join("\n");

    res.header("Content-Type", "text/csv");
    res.attachment("reports.csv");
    res.send(csvContent);
  } catch (error) {
    res.status(500).json({ message: "Error Exporting CSV", error });
  }
};

