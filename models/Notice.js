import mongoose from "mongoose";

const noticeSchema = new mongoose.Schema({
  notice: { type: String, required: true },
  file: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Notice", noticeSchema);
