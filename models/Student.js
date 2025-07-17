import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  schoolName: { type: String, required: true },
});

// Fix: Prevent model overwrite
const Student =
  mongoose.models.Student || mongoose.model("Student", studentSchema);

export default Student;
