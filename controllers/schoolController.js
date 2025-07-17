// import School from "../models/School.js";

// export const getSchools = async (req, res) => {
//   try {
//     const schools = await School.find();
//     res.json(schools);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

// export const createSchool = async (req, res) => {
//   try {
//     const school = new School(req.body);
//     await school.save();
//     res.status(201).json(school);
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };

// export const getSchoolById = async (req, res) => {
//   try {
//     const school = await School.findById(req.params.id);
//     if (!school) return res.status(404).json({ message: "School not found" });
//     res.json(school);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };
import School from "../models/School.js";

// @desc Get all schools (headquarter only)
// @route GET /api/schools
export const getSchools = async (req, res) => {
  try {
    const schools = await School.find({}).select("name");
    res.json(schools);
  } catch (error) {
    res.status(500).json({ error: "Server Error" });
  }
};