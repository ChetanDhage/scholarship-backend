import StudentModel from "../models/Student_Model.js"; // Import the correct model

export const deleteStudent = async (req, res) => {
  const { id } = req.params;

  try {
    const student = await StudentModel.findById(id);

    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }

    await student.deleteOne();
    res.status(200).json({ message: "Student deleted successfully" });
  } catch (error) {
    console.error("Error deleting student:", error);
    res.status(500).json({ error: "Server error" });
  }
};
