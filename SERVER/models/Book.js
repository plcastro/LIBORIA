const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxlength: 255,
    trim: true,
  },

  author_name: {
    type: String,
    required: true,
    maxlength: 255,
    trim: true,
  },

  category: {
    type: String,
    required: true,
    enum: ["Trending", "Romance", "Kids", "Thriller", "Textbooks"],
  },

  published_date: {
    type: Date,
    required: true,
  },

  total_copies: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
  },

  available_copies: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
    validate: {
      validator: function (value) {
        return value <= this.total_copies;
      },
      message: "Available copies cannot exceed total copies.",
    },
  },

  description: {
    type: String,
    default: null,
  },

  image: {
    type: String,
    maxlength: 500,
    default: null,
  },

  created_at: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Book", bookSchema);
