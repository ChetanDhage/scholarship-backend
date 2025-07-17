import mongoose from "mongoose";

const submissionStatusSchema = new mongoose.Schema(
  {
    schoolName: {
      type: String,
      required: true,
      index: true,
    },
    class: {
      type: String,
      required: true,
      enum: ["5", "6", "7", "8", "9", "10"],
    },
    section: {
      type: String,
      required: true,
      enum: ["A", "B", "C", "D", "E"],
    },
    month: {
      type: String,
      required: true,
      enum: [
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
      ],
    },
    year: {
      type: String,
      required: true,
    },
    totalStudents: {
      type: Number,
      required: true,
      default: 0,
    },
    studentsWithMarks: {
      type: Number,
      required: true,
      default: 0,
    },
    studentsWithSheets: {
      type: Number,
      required: true,
      default: 0,
    },
    studentsCompleted: {
      type: Number,
      required: true,
      default: 0,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtuals
submissionStatusSchema.virtual("classSection").get(function () {
  return `Class ${this.class} - Section ${this.section}`;
});

submissionStatusSchema.virtual("status").get(function () {
  if (this.totalStudents === 0) return "no students";
  if (this.studentsCompleted === this.totalStudents) return "completed";
  if (this.studentsWithMarks > 0 || this.studentsWithSheets > 0)
    return "incomplete";
  return "pending";
});

submissionStatusSchema.virtual("submission").get(function () {
  return `${this.studentsCompleted}/${this.totalStudents}`;
});

submissionStatusSchema.virtual("reason").get(function () {
  if (this.totalStudents === 0) return "No students in this section";
  if (this.studentsCompleted === this.totalStudents)
    return "All students have both marks and answer sheets";

  const missingMarks = this.totalStudents - this.studentsWithMarks;
  const missingSheets = this.totalStudents - this.studentsWithSheets;

  if (missingMarks > 0 && missingSheets > 0) {
    return `${missingMarks} missing marks, ${missingSheets} missing sheets`;
  } else if (missingMarks > 0) {
    return `${missingMarks} missing marks`;
  } else if (missingSheets > 0) {
    return `${missingSheets} missing sheets`;
  }
  return "No submissions yet";
});

// Indexes
submissionStatusSchema.index(
  { schoolName: 1, class: 1, section: 1, month: 1, year: 1 },
  { unique: true }
);

const SubmissionStatus = mongoose.model(
  "SubmissionStatus",
  submissionStatusSchema
);

export default SubmissionStatus;
