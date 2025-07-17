import StudentInfo from "../models/Student_info.js";

// @desc    Get all students
// @route   GET /api/student-info
export const getAllStudents = async (req, res) => {
  try {
    const students = await StudentInfo.find();
    res.status(200).json(students);
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Get a student by ID
// @route   GET /api/student-info/:id
export const getStudentById = async (req, res) => {
  try {
    console.log("Fetching student with ID:", req.params.id); // Log the ID
    const student = await StudentInfo.findById(req.params.id);

    if (!student) {
      console.log("Student not found in the database"); // Log if student is not found
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json(student);
  } catch (error) {
    console.error("Error fetching student:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Create a new student entry
// @route   POST /api/student-info
export const createStudentInfo = async (req, res) => {
  try {
    const newStudent = new StudentInfo(req.body);
    await newStudent.save();
    res.status(201).json(newStudent);
  } catch (error) {
    console.error("Error creating student:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Update a student
// @route   PUT /api/student-info/:id
export const updateStudent = async (req, res) => {
  try {
    const updatedStudent = await StudentInfo.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedStudent) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json(updatedStudent);
  } catch (error) {
    console.error("Error updating student:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Delete a student
// @route   DELETE /api/student-info/:id
export const deleteStudent = async (req, res) => {
  try {
    const student = await StudentInfo.findByIdAndDelete(req.params.id);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error("Error deleting student:", error);
    res.status(500).json({ message: "Server error" });
  }
};
