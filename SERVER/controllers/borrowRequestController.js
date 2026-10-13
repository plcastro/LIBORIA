
const { collection, getNextSequence } = require("../config/database");
const User = require("../models/User");

const toId = (value) => {
  const numberValue = Number(value);
  return value !== "" && !Number.isNaN(numberValue)
    ? numberValue
    : value;
};

const handleError = (res, err) => {
  console.error("Borrow request error:", err);
  return res.status(500).json({ error: "Internal Server Error" });
};

// Student submits a request for one book.
const createRequest = async (req, res) => {
  try {
    const { user_id, book_id } = req.body;

    if (!user_id || book_id === undefined || book_id === null) {
      return res.status(400).json({
        error: "Student ID and book ID are required",
      });
    }

    const user = await User.findById(user_id).select("_id name account_type");

    if (!user || !['student', 'non-librarian'].includes(user.account_type)) {
      return res.status(403).json({
        error: "A valid student account is required",
      });
    }

    const books = await collection("books");
    const requests = await collection("borrow_requests");
    const borrowedBooks = await collection("borrowed_books");

    const bookId = toId(book_id);
    const book = await books.findOne({ book_id: bookId });

    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    if (Number(book.available_copies) <= 0) {
      return res.status(400).json({
        error: "This book is currently unavailable",
      });
    }

    const existingPending = await requests.findOne({
      user_id: String(user._id),
      book_id: bookId,
      status: "Pending",
    });

    if (existingPending) {
      return res.status(409).json({
        error: "You already have a pending request for this book",
      });
    }

    // Prevent duplicate active loans where the borrower can be identified.
    const borrowers = await collection("borrowers");
    const linkedBorrower = await borrowers.findOne({
      user_id: String(user._id),
    });

    if (linkedBorrower) {
      const existingLoan = await borrowedBooks.findOne({
        borrower_id: linkedBorrower.borrower_id,
        book_id: bookId,
        status: { $regex: /^borrowed$/i },
      });

      if (existingLoan) {
        return res.status(409).json({
          error: "You have already borrowed this book",
        });
      }
    }

    const request = {
      request_id: await getNextSequence("borrow_requests"),
      user_id: String(user._id),
      student_name: user.name || user.username,
      book_id: bookId,
      status: "Pending",
      requested_at: new Date(),
      reviewed_at: null,
      rejection_reason: null,
      borrow_id: null,
    };

    await requests.insertOne(request);

    return res.status(201).json({
      message: "Borrow request submitted successfully",
      request,
    });
  } catch (err) {
    return handleError(res, err);
  }
};

// Get all requests for librarian review.
const getAllRequests = async (req, res) => {
  try {
    const requests = await collection("borrow_requests");

    const results = await requests.aggregate([
      {
        $lookup: {
          from: "books",
          localField: "book_id",
          foreignField: "book_id",
          as: "book",
        },
      },
      { $unwind: { path: "$book", preserveNullAndEmptyArrays: true } },
      { $sort: { requested_at: -1 } },
      {
        $project: {
          _id: 0,
          request_id: 1,
          user_id: 1,
          student_name: 1,
          book_id: 1,
          status: 1,
          requested_at: 1,
          reviewed_at: 1,
          rejection_reason: 1,
          borrow_id: 1,
          book_title: "$book.title",
          available_copies: "$book.available_copies",
        },
      },
    ]).toArray();

    return res.json(results);
  } catch (err) {
    return handleError(res, err);
  }
};

// Get one student's requests.
const getStudentRequests = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!userId) {
      return res.status(400).json({ error: "Student ID is required" });
    }

    const requests = await collection("borrow_requests");

    const results = await requests.aggregate([
      { $match: { user_id: String(userId) } },
      {
        $lookup: {
          from: "books",
          localField: "book_id",
          foreignField: "book_id",
          as: "book",
        },
      },
      { $unwind: { path: "$book", preserveNullAndEmptyArrays: true } },
      { $sort: { requested_at: -1 } },
      {
        $project: {
          _id: 0,
          request_id: 1,
          book_id: 1,
          status: 1,
          requested_at: 1,
          reviewed_at: 1,
          rejection_reason: 1,
          borrow_id: 1,
          book_title: "$book.title",
          book_author: "$book.author_name",
        },
      },
    ]).toArray();

    return res.json(results);
  } catch (err) {
    return handleError(res, err);
  }
};

// Librarian approves a pending request.
const approveRequest = async (req, res) => {
  try {
    const requestId = toId(req.params.id);
    const requests = await collection("borrow_requests");
    const books = await collection("books");
    const borrowers = await collection("borrowers");
    const borrowedBooks = await collection("borrowed_books");

    const request = await requests.findOne({
      request_id: requestId,
    });

    if (!request) {
      return res.status(404).json({ error: "Request not found" });
    }

    if (request.status !== "Pending") {
      return res.status(409).json({
        error: "Only pending requests can be approved",
      });
    }

    const borrower = await borrowers.findOne({
      user_id: String(request.user_id),
    });

    if (!borrower) {
      return res.status(400).json({
        error:
          "This student has no linked borrower record. Link or create the borrower record before approving this request.",
      });
    }

    const bookUpdate = await books.updateOne(
      {
        book_id: request.book_id,
        available_copies: { $gt: 0 },
      },
      { $inc: { available_copies: -1 } }
    );

    if (bookUpdate.modifiedCount !== 1) {
      return res.status(400).json({
        error: "No copies are currently available",
      });
    }

    try {
      const borrowId = await getNextSequence("borrowed_books");
      const dateBorrowed = new Date();
      const dueDate = new Date(dateBorrowed);
      dueDate.setDate(dueDate.getDate() + 14);

      await borrowedBooks.insertOne({
        borrow_id: borrowId,
        borrower_id: borrower.borrower_id,
        book_id: request.book_id,
        date_borrowed: dateBorrowed,
        due_date: dueDate,
        status: "Borrowed",
        created_at: new Date(),
      });

      const result = await requests.updateOne(
        { request_id: requestId, status: "Pending" },
        {
          $set: {
            status: "Approved",
            reviewed_at: new Date(),
            borrow_id: borrowId,
          },
        }
      );

      if (result.modifiedCount !== 1) {
        await borrowedBooks.deleteOne({ borrow_id: borrowId });
        await books.updateOne(
          { book_id: request.book_id },
          { $inc: { available_copies: 1 } }
        );

        return res.status(409).json({
          error: "Request status changed. Please refresh and try again.",
        });
      }

      return res.json({
        message: "Request approved and book marked as borrowed",
        borrow_id: borrowId,
      });
    } catch (err) {
      await books.updateOne(
        { book_id: request.book_id },
        { $inc: { available_copies: 1 } }
      );
      throw err;
    }
  } catch (err) {
    return handleError(res, err);
  }
};

// Librarian rejects a pending request.
const rejectRequest = async (req, res) => {
  try {
    const requestId = toId(req.params.id);
    const reason = String(req.body.reason || "").trim();
    const requests = await collection("borrow_requests");

    const result = await requests.updateOne(
      { request_id: requestId, status: "Pending" },
      {
        $set: {
          status: "Rejected",
          reviewed_at: new Date(),
          rejection_reason: reason || "Request rejected by librarian",
        },
      }
    );

    if (result.matchedCount === 0) {
      const existing = await requests.findOne({ request_id: requestId });

      return res.status(existing ? 409 : 404).json({
        error: existing
          ? "Only pending requests can be rejected"
          : "Request not found",
      });
    }

    return res.json({ message: "Borrow request rejected" });
  } catch (err) {
    return handleError(res, err);
  }
};

module.exports = {
  createRequest,
  getAllRequests,
  getStudentRequests,
  approveRequest,
  rejectRequest,
};
