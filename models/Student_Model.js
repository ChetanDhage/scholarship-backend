import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  class: { type: String, required: true },
  section: { type: String, required: true },
  address: { type: String, required: true },
  gender: { type: String, required: true },
  image: { type: String, required: true },
});

const StudentModel =
  mongoose.models.StudentModel || mongoose.model("StudentModel", StudentSchema);

export default StudentModel;
