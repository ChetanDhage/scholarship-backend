import mongoose from "mongoose";

const StudentAnswerSchema = new mongoose.Schema(
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
    class: {
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
    answerSheet: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["uploaded", "saved", "checked", "published"],
      default: "uploaded",
    },
    metadata: {
      originalName: String,
      size: Number,
      mimetype: String,
      uploadedAt: {
        type: Date,
        default: Date.now,
      },
    },
  },
  { timestamps: true }
);

StudentAnswerSchema.index(
  { rollNo: 1, month: 1, year: 1, schoolName: 1 },
  { unique: true }
);

export default mongoose.model("StudentAnswer", StudentAnswerSchema);
