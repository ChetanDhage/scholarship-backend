import mongoose from "mongoose";

const StudentInfoSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    schoolName: { type: String, required: true },
    schoolCity: { type: String, required: true },
    class: { type: String, required: true },
    gender: { type: String, required: true },
    dob: { type: String, required: true },
    parentName: { type: String, required: true },
    contact: { type: String, required: true },
    address: { type: String, required: true },
    rollno: { type: String, required: true },
    image: { type: String, required: false },
    practice_exam: { type: [String], default: [] },
  },
  { timestamps: true }
);

// Explicitly set the collection name to "studentinfos"
const StudentInfo = mongoose.model(
  "StudentInfo",
  StudentInfoSchema,
  "studentinfos"
);

export default StudentInfo;
