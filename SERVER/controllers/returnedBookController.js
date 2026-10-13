const { collection, getNextSequence } = require("../config/database");

const toId = (value) => {
  const numberValue = Number(value);
  return Number.isNaN(numberValue) ? value : numberValue;
};

const handleError = (res, err) => {
  console.error(err);
  return res.status(500).json({ error: "Internal Server Error" });
};

const returnDetailsPipeline = (match = {}) => [
  { $match: match },
  {
    $lookup: {
      from: "borrowed_books",
      localField: "borrow_id",
      foreignField: "borrow_id",
      as: "borrow",
    },
  },
  { $unwind: { path: "$borrow", preserveNullAndEmptyArrays: true } },
  {
    $lookup: {
      from: "books",
      localField: "borrow.book_id",
      foreignField: "book_id",
      as: "book",
    },
  },
  {
    $lookup: {
      from: "borrowers",
      localField: "borrow.borrower_id",
      foreignField: "borrower_id",
      as: "borrower",
    },
  },
  { $unwind: { path: "$book", preserveNullAndEmptyArrays: true } },
  { $unwind: { path: "$borrower", preserveNullAndEmptyArrays: true } },
  { $sort: { returned_date: -1 } },
  {
    $project: {
      _id: 0,
      return_id: 1,
      borrow_id: 1,
      returned_date: 1,
      violation: 1,
      penalty: 1,
      amount_paid: 1,
      book_id: "$borrow.book_id",
      borrower_id: "$borrow.borrower_id",
      date_borrowed: "$borrow.date_borrowed",
      borrowed_date: "$borrow.date_borrowed",
      due_date: "$borrow.due_date",
      title: "$book.title",
      author_name: "$book.author_name",
      author: "$book.author_name",
      borrower_name: "$borrower.name",
      
      email: "$borrower.email",
    },
  },
];

// GET all returned books with details
const getReturnedBooks = async (req, res) => {
  try {
    const returnedBooks = await collection("returned_books");
    const results = await returnedBooks.aggregate(returnDetailsPipeline()).toArray();
    res.json(results);
  } catch (err) {
    handleError(res, err);
  }
};

// GET returned book by ID
const getReturnedBookById = async (req, res) => {
  try {
    const returnedBooks = await collection("returned_books");
    const results = await returnedBooks
      .aggregate(returnDetailsPipeline({ return_id: toId(req.params.id) }))
      .toArray();

    if (results.length === 0) {
      return res.status(404).json({ error: "Return record not found" });
    }

    res.json(results[0]);
  } catch (err) {
    handleError(res, err);
  }
};

// RETURN a book (mark as returned)
const returnBook = async (req, res) => {
  try {
    const borrowId = toId(req.body?.borrow_id);
    const { violation, penalty, amount_paid, returned_date } = req.body || {};

    if (!borrowId) {
      return res.status(400).json({ error: "Borrow ID is required" });
    }

    const borrowedBooks = await collection("borrowed_books");
    const returnedBooks = await collection("returned_books");
    const books = await collection("books");
    const borrowRecord = await borrowedBooks.findOne({ borrow_id: borrowId });

    if (!borrowRecord) {
      return res.status(404).json({ error: "Borrow record not found" });
    }

    const existingReturn = await returnedBooks.findOne({ borrow_id: borrowId });
    if (existingReturn) {
      return res.status(400).json({ error: "Book already returned" });
    }

    const violationsArray = Array.isArray(violation)
      ? violation
      : violation
        ? [violation]
        : ["None"];
    const violationString = violationsArray.join(", ");
    const penaltyValue = Number(penalty) || 0;
    const amountPaidValue = Number(amount_paid) || 0;

    if (
      !violationsArray.includes("Lost") &&
      penaltyValue > 0 &&
      amountPaidValue < penaltyValue
    ) {
      return res.status(400).json({ error: "Amount paid must cover the penalty" });
    }

    const returnId = await getNextSequence("returned_books");
    await returnedBooks.insertOne({
      return_id: returnId,
      borrow_id: borrowId,
      returned_date: returned_date || new Date(),
      violation: violationString,
      penalty: penaltyValue,
      amount_paid: amountPaidValue,
      created_at: new Date(),
    });

    if (!violationsArray.includes("Lost")) {
      await books.updateOne(
        { book_id: borrowRecord.book_id },
        { $inc: { available_copies: 1 } }
      );
    }

    await borrowedBooks.updateOne(
      { borrow_id: borrowId },
      { $set: { status: violationsArray.includes("Lost") ? "Lost" : "Returned" } }
    );

    res.status(201).json({
      message: violationsArray.includes("Lost")
        ? "Book marked as lost"
        : "Book returned successfully",
      return_id: returnId,
    });
  } catch (err) {
    handleError(res, err);
  }
};

// UPDATE returned book record
const updateReturnedBook = async (req, res) => {
  try {
    const returnId = toId(req.params.id);
    const { violation, penalty, amount_paid } = req.body || {};
    const returnedBooks = await collection("returned_books");

    const result = await returnedBooks.updateOne(
      { return_id: returnId },
      {
        $set: {
          violation: Array.isArray(violation) ? violation.join(", ") : violation,
          penalty: Number(penalty) || 0,
          amount_paid: Number(amount_paid) || 0,
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Return record not found" });
    }

    const returnResults = await returnedBooks
      .aggregate(returnDetailsPipeline({ return_id: returnId }))
      .toArray();

    res.json(returnResults[0]);
  } catch (err) {
    handleError(res, err);
  }
};

// DELETE returned book record
const deleteReturnedBook = async (req, res) => {
  try {
    const returnId = toId(req.params.id);
    const returnedBooks = await collection("returned_books");
    const borrowedBooks = await collection("borrowed_books");
    const books = await collection("books");
    const returnRecord = await returnedBooks.findOne({ return_id: returnId });

    if (!returnRecord) {
      return res.status(404).json({ error: "Return record not found" });
    }

    const borrowRecord = await borrowedBooks.findOne({
      borrow_id: returnRecord.borrow_id,
    });

    if (!borrowRecord) {
      return res.status(404).json({ error: "Book not found" });
    }

    await borrowedBooks.updateOne(
      { borrow_id: returnRecord.borrow_id },
      { $set: { status: "Borrowed" }, $unset: { returned_date: "" } }
    );
    await books.updateOne(
      { book_id: borrowRecord.book_id },
      { $inc: { available_copies: -1 } }
    );
    await returnedBooks.deleteOne({ return_id: returnId });

    res.json({ message: "Return record deleted successfully" });
  } catch (err) {
    handleError(res, err);
  }
};

// GET return statistics
const getReturnStats = async (req, res) => {
  try {
    const returnedBooks = await collection("returned_books");
    const results = await returnedBooks
      .aggregate([
        {
          $group: {
            _id: "$violation",
            total_returns: { $sum: 1 },
            total_penalties: { $sum: "$penalty" },
            total_amount_paid: { $sum: "$amount_paid" },
            count_by_violation: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            violation: "$_id",
            total_returns: 1,
            total_penalties: 1,
            total_amount_paid: 1,
            count_by_violation: 1,
          },
        },
      ])
      .toArray();

    res.json(results);
  } catch (err) {
    handleError(res, err);
  }
};

// GET returns by date range
const getReturnsByDateRange = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    if (!start_date || !end_date) {
      return res
        .status(400)
        .json({ error: "Start date and end date are required" });
    }

    const returnedBooks = await collection("returned_books");
    const results = await returnedBooks
      .aggregate(
        returnDetailsPipeline({
          returned_date: { $gte: start_date, $lte: end_date },
        })
      )
      .toArray();

    res.json(results);
  } catch (err) {
    handleError(res, err);
  }
};

// GET outstanding penalties (where penalty > amount_paid)
const getOutstandingPenalties = async (req, res) => {
  try {
    const returnedBooks = await collection("returned_books");
    const results = await returnedBooks
      .aggregate([
        {
          $match: {
            $expr: { $gt: ["$penalty", "$amount_paid"] },
          },
        },
        ...returnDetailsPipeline().slice(1),
      ])
      .toArray();

    res.json(results);
  } catch (err) {
    handleError(res, err);
  }
};

module.exports = {
  getReturnedBooks,
  getReturnedBookById,
  returnBook,
  updateReturnedBook,
  deleteReturnedBook,
  getReturnStats,
  getReturnsByDateRange,
  getOutstandingPenalties,
};
