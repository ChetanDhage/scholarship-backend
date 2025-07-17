import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import reportRoutes from "./routes/reports.js";
import submissionRoutes from "./routes/submissionRoutes.js";
import studentDataRoutes from "./routes/Student_data.js";
import viewStudentRoutes from "./routes/View_student.js";
import monthlyDataRoutes from "./routes/Monthly_data.js";
import studentsRoutes from "./routes/studentsRoutes.js";
import optionsRoutes from "./routes/optionsRoutes.js";
import studentInfoRoutes from "./routes/Student_info.js";
import bodyParser from "body-parser";
import path from "path";
import schoolRoutes from "./routes/schoolRoutes.js";
import { createServer } from "http";
import { initSocket } from "./socket.js";

dotenv.config();
connectDB();

const app = express();
const server = createServer(app);

// Initialize Socket.io
initSocket(server);

app.use(express.json());
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json()); // Parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes); // Profile Update route
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/uploads", express.static("uploads")); // Serve uploaded files
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/v1/submissions", submissionRoutes);
app.use("/api/student-data", studentDataRoutes);
app.use("/api/view-student", viewStudentRoutes); // ✅ Separate route for View_student
app.use("/api/monthly-data", monthlyDataRoutes);
app.use("/api/students", studentsRoutes);
app.use("/api/options", optionsRoutes);
app.use("/api/student-info", studentInfoRoutes); // ✅ Mount Student_info routes
app.use("/api/schools", schoolRoutes);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
