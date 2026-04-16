const Attendant = require("../models/Attendant");

// POST /attendants
const createAttendant = async (req, res, next) => {
  try {
    const { name, staffId } = req.body;
    if (!name || !staffId) {
      return res.status(400).json({ success: false, message: "name and staffId are required" });
    }
    const attendant = await Attendant.create({ name, staffId });
    res.status(201).json({ success: true, data: attendant });
  } catch (error) {
    next(error);
  }
};

// GET /attendants
const getAllAttendants = async (req, res, next) => {
  try {
    const attendants = await Attendant.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: attendants.length, data: attendants });
  } catch (error) {
    next(error);
  }
};

module.exports = { createAttendant, getAllAttendants };