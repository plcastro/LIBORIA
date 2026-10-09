const mongoose = require("mongoose");

const borrowerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: 255,
    trim: true,
  },

  year_level: {
    type: String,
    required: true,
    maxlength: 50,
  },

  course: {
    type: String,
    required: true,
    maxlength: 100,
  },

  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Borrower", borrowerSchema);
