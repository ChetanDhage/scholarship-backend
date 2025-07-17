import Option from "../models/Option.js";

// @desc Fetch all options
// @route GET /api/options
// @access Public
export const getOptions = async (req, res) => {
  try {
    const options = await Option.find({}).select("name -_id");
    res
      .status(200)
      .json({ success: true, options: options.map((o) => o.name) });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};

// @desc Add a new option
// @route POST /api/options
// @access Private (Admin only)
export const addOption = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name)
      return res
        .status(400)
        .json({ success: false, message: "Option name is required" });

    const existingOption = await Option.findOne({ name });
    if (existingOption)
      return res
        .status(400)
        .json({ success: false, message: "Option already exists" });

    const newOption = new Option({ name });
    await newOption.save();

    res
      .status(201)
      .json({
        success: true,
        message: "Option added successfully",
        option: newOption,
      });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server Error", error: error.message });
  }
};
