const mongoose = require("mongoose");

const attendantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Attendant name is required"],
      trim: true,
    },
    staffId: {
      type: String,
      required: [true, "Staff ID is required"],
      unique: true,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Attendant", attendantSchema);