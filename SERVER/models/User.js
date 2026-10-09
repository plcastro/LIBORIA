const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    maxlength: 255,
    trim: true,
  },

  password: {
    type: String,
    required: true,
    select: false,
  },

  name: {
    type: String,
    maxlength: 255,
    default: null,
  },

  email: {
    type: String,
    maxlength: 255,
    default: null,
    lowercase: true,
    trim: true,
  },

  account_type: {
    type: String,
    enum: ["admin", "librarian"],
    default: "librarian",
  },

  reset_token: {
    type: String,
    default: null,
    select: false,
  },

  reset_token_expiry: {
    type: Date,
    default: null,
    select: false,
  },
});

module.exports = mongoose.model("User", userSchema);
