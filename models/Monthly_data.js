import mongoose from "mongoose";

const MonthlySchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StudentData",
      required: true,
    },
    rollNo: {
      type: String,
      required: true,
      index: true,
    },
    session: {
      type: String,
      required: true,
    },
    marks: {
      type: Map,
      of: Number,
      default: {},
    },
    studentClass: {
      type: String,
      required: true,
    },
    section: {
      type: String,
      required: true,
    },
    schoolName: {
      type: String,
      required: true,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

MonthlySchema.index(
  { rollNo: 1, studentClass: 1, section: 1, session: 1, schoolName: 1 },
  { unique: true }
);

const MonthlyData = mongoose.model(
  "MonthlyData",
  MonthlySchema,
  "monthly_data"
);

export default MonthlyData;
