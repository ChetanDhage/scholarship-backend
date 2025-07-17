import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  rollNo: { type: String, required: true },
  schoolName: { type: String, required: true },
  schoolAddress: { type: String, required: true },
  schoolId: { type: String, required: true },
  studentClass: { type: String, required: true },
  dob: { type: String, required: true },
  email: { type: String, required: true, unique: true }, // ✅ Email must be unique across all schools
  parentName: { type: String, required: true },
  address: { type: String, required: true },
  contact: { type: String, required: true },
  image: { type: String, required: false },
  year: { type: String, required: true },
  section: { type: String, required: true },
  gender: { type: String, required: true },
});

// ✅ Ensure (rollNo + schoolId) is unique within the same school
StudentSchema.index({ rollNo: 1, schoolId: 1 }, { unique: true });

// Explicitly set the collection name
const StudentData = mongoose.model(
  "StudentData",
  StudentSchema,
  "studentdatas"
);

export default StudentData;
