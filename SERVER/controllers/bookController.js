const { collection, getNextSequence } = require("../config/database");

const toId = (value) => {
  const numberValue = Number(value);
  return Number.isNaN(numberValue) ? value : numberValue;
};

const handleError = (res, err) => {
  console.error("Book controller error:", err);

  if (err.code === 11000) {
    return res.status(409).json({
      error: "A book with the same unique value already exists.",
    });
  }

  return res.status(500).json({
    error: "Internal Server Error",
    ...(process.env.NODE_ENV !== "production" && {
      details: err.message,
    }),
  });
};

// GET all books
const getBooks = async (req, res) => {
  try {
    const books = collection("books");
    const results = await books.find({}).toArray();

    return res.json(results);
  } catch (err) {
    return handleError(res, err);
  }
};

// GET book by ID
const getBookById = async (req, res) => {
  try {
    const books = await collection("books");
    const book = await books.findOne({ book_id: toId(req.params.id) });

    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    res.json(book);
  } catch (err) {
    handleError(res, err);
  }
};

// CREATE book with case-insensitive title check
const createBook = async (req, res) => {
  try {
    const {
      title,
      author_name,
      category,
      published_date,
      total_copies,
      available_copies,
      description,
      image,
    } = req.body || {};

    const trimmedTitle = String(title || "").trim();
    const trimmedAuthor = String(author_name || "").trim();

    if (!trimmedTitle || !trimmedAuthor) {
      return res.status(400).json({ error: "Title and author are required" });
    }

    if (!category) {
      return res.status(400).json({ error: "Category is required" });
    }

    const totalCopies = Number(total_copies);
    const availableCopies = Number(available_copies ?? total_copies);

    if (!Number.isInteger(totalCopies) || totalCopies < 1) {
      return res.status(400).json({ error: "Total copies must be at least 1" });
    }

    if (
      !Number.isInteger(availableCopies) ||
      availableCopies < 0 ||
      availableCopies > totalCopies
    ) {
      return res.status(400).json({
        error: "Available copies must be between 0 and total copies",
      });
    }

    const books = await collection("books");
    const existingBook = await books.findOne({
      title: {
        $regex: `^${trimmedTitle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
        $options: "i",
      },
    });

    if (existingBook) {
      return res.status(400).json({
        error: `Book title "${existingBook.title}" is already taken (by ${existingBook.author_name}). Please use a different title.`,
      });
    }

    const book = {
      book_id: await getNextSequence("books"),
      title: trimmedTitle,
      author_name: trimmedAuthor,
      category,
      published_date,
      total_copies: totalCopies,
      available_copies: availableCopies,
      description: description || null,
      image: image || null,
      created_at: new Date(),
    };

    await books.insertOne(book);
    res.status(201).json(book);
  } catch (err) {
    handleError(res, err);
  }
};

// UPDATE book
const updateBook = async (req, res) => {
  try {
    const bookId = toId(req.params.id);
    const {
      title,
      author_name,
      category,
      published_date,
      total_copies,
      available_copies,
      description,
      image,
    } = req.body || {};

    const books = await collection("books");
    const existingTitle = await books.findOne({
      book_id: { $ne: bookId },
      title,
    });

    if (existingTitle) {
      return res
        .status(400)
        .json({ error: "Book title is already taken by another book" });
    }

    const update = {
      title,
      author_name,
      category,
      published_date,
      total_copies: Number(total_copies) || 0,
      available_copies: Number(available_copies) || 0,
      description,
      image,
    };

    const result = await books.findOneAndUpdate(
      { book_id: bookId },
      { $set: update },
      { returnDocument: "after" },
    );
    const updatedBook = result.value || result;

    if (!updatedBook) {
      return res.status(404).json({ error: "Book not found" });
    }

    res.json(updatedBook);
  } catch (err) {
    handleError(res, err);
  }
};

// DELETE book
const deleteBook = async (req, res) => {
  try {
    const bookId = toId(req.params.id);
    const borrowedBooks = await collection("borrowed_books");
    const activeBorrow = await borrowedBooks.findOne({
      book_id: bookId,
      status: { $regex: /^borrowed$/i },
    });

    if (activeBorrow) {
      return res
        .status(400)
        .json({ error: "Cannot delete book. It is currently borrowed." });
    }

    const books = await collection("books");
    const result = await books.deleteOne({ book_id: bookId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Book not found" });
    }

    res.json({ message: "Book deleted successfully" });
  } catch (err) {
    handleError(res, err);
  }
};

// SEARCH books
const searchBooks = async (req, res) => {
  try {
    const { q = "" } = req.query;
    const books = await collection("books");
    const search = { $regex: q, $options: "i" };
    const results = await books
      .find({
        $or: [{ title: search }, { author_name: search }, { category: search }],
      })
      .toArray();

    res.json(results);
  } catch (err) {
    handleError(res, err);
  }
};

module.exports = {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  searchBooks,
};
