import StudentData from "../models/Student_data.js";

export const createStudent = async (req, res) => {
  try {
    const {
      fullName,
      rollNo,
      schoolName,
      schoolAddress,
      schoolId,
      studentClass,
      dob,
      email,
      parentName,
      address,
      contact,
      year,
      section,
      gender,
    } = req.body;

    // ✅ Check if the email already exists within the same school
    const existingEmail = await StudentData.findOne({ email, schoolId });
    if (existingEmail) {
      return res
        .status(400)
        .json({ error: "Email already exists for this school." });
    }

    // ✅ Check if the roll number already exists within the same school
    const existingRollNo = await StudentData.findOne({ rollNo, schoolId });
    if (existingRollNo) {
      return res
        .status(400)
        .json({ error: "Roll number already exists for this school." });
    }

    // ✅ Handle image upload
    let imageUrl = "";
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    // ✅ Create new student record
    const newStudent = new StudentData({
      fullName,
      rollNo,
      schoolName,
      schoolAddress,
      schoolId,
      studentClass,
      dob,
      email,
      parentName,
      address,
      contact,
      image: imageUrl,
      year,
      section,
      gender,
    });

    await newStudent.save();
    res.status(201).json({ message: "Student added successfully!" });
  } catch (error) {
    console.error("Error adding student:", error);

    if (error.code === 11000) {
      return res
        .status(400)
        .json({
          error: "Email or Roll Number already exists for this school.",
        });
    }

    res.status(500).json({ error: "Internal server error" });
  }
};

// @desc    Get students by school
// @route   GET /api/student-data
export const getStudentsBySchool = async (req, res) => {
  try {
    const { schoolName } = req.user; // Assuming schoolName is stored in the user object

    // Fetch students for the logged-in user's school
    const students = await StudentData.find({ schoolName });
    res.status(200).json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ error: "Server error" });
  }
};
