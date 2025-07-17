import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    schoolName: { type: String, required: true },
    address: { type: String, required: true },
    role: { type: String, enum: ["teacher", "headquarter"], required: true },
    phone: { type: String, required: true },
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: "School" }, // Link to School model
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);