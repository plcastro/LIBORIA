const { collection, getNextSequence } = require("../config/database");
const {
  activeStatus,
  getMaxBorrowedBooks,
  getBorrowUsage,
  limitMessage,
} = require("../services/borrowLimit");

const toId = (value) => {
  const numberValue = Number(value);
  return Number.isNaN(numberValue) ? value : numberValue;
};

const handleError = (res, err) => {
  console.error(err);
  return res.status(500).json({ error: "Internal Server Error" });
};

const borrowDetailsPipeline = (match = {}) => [
  { $match: match },
  {
    $lookup: {
      from: "books",
      localField: "book_id",
      foreignField: "book_id",
      as: "book",
    },
  },
  {
    $lookup: {
      from: "borrowers",
      localField: "borrower_id",
      foreignField: "borrower_id",
      as: "borrower",
    },
  },
  { $unwind: { path: "$book", preserveNullAndEmptyArrays: true } },
  { $unwind: { path: "$borrower", preserveNullAndEmptyArrays: true } },
  { $sort: { date_borrowed: -1 } },
  {
    $project: {
      _id: 0,
      borrow_id: 1,
      borrower_id: 1,
      book_id: 1,
      date_borrowed: 1,
      due_date: 1,
      status: 1,
      created_at: 1,
      title: "$book.title",
      author_name: "$book.author_name",
      borrower_name: "$borrower.name",
    },
  },
];

const getBorrowedBooks = async (req, res) => {
  try {
    const borrowedBooks = await collection("borrowed_books");
    let match = {};
    if (req.user.account_type !== "librarian") {
      const borrowers = await collection("borrowers");
      const own = await borrowers
        .find({ user_id: req.user.id }, { projection: { borrower_id: 1 } })
        .toArray();
      match = { borrower_id: { $in: own.map((item) => item.borrower_id) } };
    }
    const results = await borrowedBooks
      .aggregate(borrowDetailsPipeline(match))
      .toArray();
    res.json(results);
  } catch (err) {
    handleError(res, err);
  }
};

const getBorrowedBookById = async (req, res) => {
  try {
    const borrowedBooks = await collection("borrowed_books");
    const results = await borrowedBooks
      .aggregate(borrowDetailsPipeline({ borrow_id: toId(req.params.id) }))
      .toArray();

    if (results.length === 0) {
      return res.status(404).json({ error: "Borrow record not found" });
    }

    res.json(results[0]);
  } catch (err) {
    handleError(res, err);
  }
};

const borrowBook = async (req, res) => {
  try {
    const bookId = toId(req.body?.book_id);
    const borrowerId = toId(req.body?.borrower_id);
    const { due_date } = req.body || {};

    if (!bookId || !borrowerId || !due_date) {
      return res.status(400).json({
        error: "Book ID, borrower ID, and due date are required",
      });
    }

    const books = await collection("books");
    const borrowedBooks = await collection("borrowed_books");
    const book = await books.findOne({
      book_id: bookId,
      available_copies: { $gt: 0 },
    });

    if (!book) {
      return res
        .status(400)
        .json({ error: "Book not available for borrowing" });
    }

    const duplicate = await borrowedBooks.findOne({
      book_id: bookId,
      borrower_id: borrowerId,
      status: activeStatus,
    });

    if (duplicate) {
      return res
        .status(400)
        .json({ error: "You have already borrowed this book" });
    }

    const activeBorrows = await borrowedBooks.countDocuments({
      borrower_id: borrowerId,
      status: activeStatus,
    });

    const borrower = await collection("borrowers").findOne({
      borrower_id: borrowerId,
    });
    const used = borrower?.user_id
      ? (await getBorrowUsage(borrower.user_id, borrowerId)).used
      : activeBorrows;
    if (used >= getMaxBorrowedBooks()) {
      return res.status(400).json({
        error: limitMessage(getMaxBorrowedBooks()),
      });
    }

    const bookUpdate = await books.updateOne(
      { book_id: bookId, available_copies: { $gt: 0 } },
      { $inc: { available_copies: -1 } },
    );

    if (bookUpdate.modifiedCount === 0) {
      return res
        .status(400)
        .json({ error: "Book not available for borrowing" });
    }

    const borrowId = await getNextSequence("borrowed_books");
    const borrowRecord = {
      borrow_id: borrowId,
      book_id: bookId,
      borrower_id: borrowerId,
      date_borrowed: new Date(),
      due_date,
      status: "Borrowed",
      created_at: new Date(),
    };

    try {
      await borrowedBooks.insertOne(borrowRecord);
    } catch (err) {
      await books.updateOne(
        { book_id: bookId },
        { $inc: { available_copies: 1 } },
      );
      throw err;
    }

    const finalResults = await borrowedBooks
      .aggregate(borrowDetailsPipeline({ borrow_id: borrowId }))
      .toArray();

    res.status(201).json({
      message: "Book borrowed successfully",
      borrowRecord: finalResults[0],
    });
  } catch (err) {
    handleError(res, err);
  }
};

const updateBorrowedBook = async (req, res) => {
  try {
    const borrowId = toId(req.params.id);
    const { status } = req.body || {};
    const borrowedBooks = await collection("borrowed_books");

    const result = await borrowedBooks.updateOne(
      { borrow_id: borrowId },
      { $set: { status } },
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Borrow record not found" });
    }

    const borrowResults = await borrowedBooks
      .aggregate(borrowDetailsPipeline({ borrow_id: borrowId }))
      .toArray();

    res.json({
      message: "Borrowed book status updated successfully",
      updatedRecord: borrowResults[0],
    });
  } catch (err) {
    console.error("Error updating borrowed_books:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

const getBorrowedBooksByBorrower = async (req, res) => {
  try {
    const borrowedBooks = await collection("borrowed_books");
    const borrowerId = toId(req.params.borrowerId);
    const results = await borrowedBooks
      .aggregate(
        borrowDetailsPipeline({
          borrower_id: borrowerId,
          status: activeStatus,
        }),
      )
      .toArray();

    res.json(
      results.sort((a, b) =>
        String(a.due_date).localeCompare(String(b.due_date)),
      ),
    );
  } catch (err) {
    handleError(res, err);
  }
};

// GET active borrowed books count for a borrower
const getActiveBorrowsCount = async (req, res) => {
  try {
    const borrowedBooks = await collection("borrowed_books");
    const activeBorrows = await borrowedBooks.countDocuments({
      borrower_id: toId(req.params.borrowerId),
      status: activeStatus,
    });

    res.json({ active_borrows: activeBorrows });
  } catch (err) {
    handleError(res, err);
  }
};

module.exports = {
  getBorrowedBooks,
  getBorrowedBookById,
  borrowBook,
  updateBorrowedBook,
  getBorrowedBooksByBorrower,
  getActiveBorrowsCount,
};
