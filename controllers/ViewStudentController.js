import StudentData from "../models/Student_data.js";

export const getStudents = async (req, res) => {
  try {
    const { schoolName } = req.user;
    const students = await StudentData.find({ schoolName });
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getStudentById = async (req, res) => {
  try {
    const student = await StudentData.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const updateStudent = async (req, res) => {
  try {
    const updatedStudent = await StudentData.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
        context: "query", // Required for proper validation
      }
    );

    if (!updatedStudent) {
      return res.status(404).json({
        status: "error",
        message: "Student not found",
      });
    }

    res.status(200).json({
      status: "success",
      data: updatedStudent,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: "Validation Error",
      error: error.message,
    });
  }
};

// Delete Student
export const deleteStudent = async (req, res) => {
  try {
    const student = await StudentData.findByIdAndDelete(req.params.id);

    if (!student) {
      return res.status(404).json({
        status: "error",
        message: "Student not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Student deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Server Error",
      error: error.message,
    });
  }
};
