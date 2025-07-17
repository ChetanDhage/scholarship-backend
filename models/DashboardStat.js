import mongoose from "mongoose";

const dashboardStatSchema = new mongoose.Schema({
  label_name: String,
  value: Number,
  icon: String,
  color: String,
});

export default mongoose.model("DashboardStat", dashboardStatSchema);
