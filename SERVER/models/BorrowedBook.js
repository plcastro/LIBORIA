const mongoose = require("mongoose");

const borrowedBookSchema = new mongoose.Schema({
  borrower_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Borrower",
    required: true,
  },

  book_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Book",
    required: true,
  },

  date_borrowed: {
    type: Date,
    required: true,
  },

  due_date: {
    type: Date,
    required: true,
    validate: {
      validator: function (value) {
        return value >= this.date_borrowed;
      },
      message: "Due date cannot be before the borrowing date.",
    },
  },

  status: {
    type: String,
    enum: ["Borrowed", "Returned", "Lost"],
    default: "Borrowed",
    required: true,
  },

  created_at: {
    type: Date,
    default: Date.now,
  },
});

borrowedBookSchema.index({ borrower_id: 1 });
borrowedBookSchema.index({ book_id: 1 });

module.exports = mongoose.model("BorrowedBook", borrowedBookSchema);
