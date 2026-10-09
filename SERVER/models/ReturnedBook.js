const mongoose = require("mongoose");

const returnedBookSchema = new mongoose.Schema({
  borrow_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "BorrowedBook",
    required: true,
  },

  returned_date: {
    type: Date,
    default: null,
  },

  violation: {
    type: String,
    enum: ["None", "Late Return", "Damaged", "Lost"],
    default: "None",
    required: true,
  },

  penalty: {
    type: mongoose.Schema.Types.Decimal128,
    default: "0.00",
  },

  amount_paid: {
    type: mongoose.Schema.Types.Decimal128,
    default: "0.00",
  },

  created_at: {
    type: Date,
    default: Date.now,
  },
});

returnedBookSchema.index({ borrow_id: 1 });

module.exports = mongoose.model("ReturnedBook", returnedBookSchema);
