import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  schoolName: { type: String, required: true },
  className: { type: String, required: true },
  totalStudents: { type: Number, required: true },
  passedStudents: { type: Number, required: true },
  failedStudents: { type: Number, required: true },
});

const Report = mongoose.model("Report", reportSchema);
export default Report;
