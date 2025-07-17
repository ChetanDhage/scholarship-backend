// import mongoose from "mongoose";

// const SchoolSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true },
//     address: { type: String, required: true },
//     students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }], // Link to Student model
//   },
//   { timestamps: true }
// );

// export default mongoose.model("School", SchoolSchema);
import mongoose from "mongoose";

const SchoolSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    address: { type: String, required: true },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: "Student" }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.model("School", SchoolSchema);