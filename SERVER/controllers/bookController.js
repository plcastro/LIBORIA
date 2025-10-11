const db = require("../config/database"); // Import from config

// GET all books
const getBooks = (req, res) => {
  const query = "SELECT * FROM books";

  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.json(results);
  });
};

// GET book by ID
const getBookById = (req, res) => {
  const bookId = req.params.id;
  const query = "SELECT * FROM books WHERE book_id = ?";

  db.query(query, [bookId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Book not found" });
    }

    res.json(results[0]);
  });
};

// CREATE book with case-insensitive title check
const createBook = (req, res) => {
  const {
    title,
    author_name,
    category,
    published_date,
    total_copies,
    available_copies,
    description,
    image,
  } = req.body;

  if (!title || !author_name) {
    return res.status(400).json({ error: "Title and author are required" });
  }

  const trimmedTitle = title.trim();

  // Check if book with same title already exists (case-insensitive)
  const checkBookQuery =
    "SELECT book_id, title, author_name FROM books WHERE LOWER(title) = LOWER(?)";

  db.query(checkBookQuery, [trimmedTitle], (err, bookResults) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (bookResults.length > 0) {
      const existingBook = bookResults[0];
      return res.status(400).json({
        error: `Book title "${existingBook.title}" is already taken (by ${existingBook.author_name}). Please use a different title.`,
      });
    }

    // If book title doesn't exist, proceed with creation
    const insertQuery = `
      INSERT INTO books (title, author_name, category, published_date, total_copies, available_copies, description, image) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      insertQuery,
      [
        trimmedTitle,
        author_name.trim(),
        category,
        published_date,
        total_copies || 0,
        available_copies || total_copies || 0,
        description,
        image,
      ],
      (err, results) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Internal Server Error" });
        }

        // Get the newly created book
        const getQuery = "SELECT * FROM books WHERE book_id = ?";
        db.query(getQuery, [results.insertId], (err, bookResults) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ error: "Internal Server Error" });
          }
          res.status(201).json(bookResults[0]);
        });
      }
    );
  });
};

// UPDATE book
const updateBook = (req, res) => {
  const bookId = req.params.id;
  const {
    title,
    author_name,
    category,
    published_date,
    total_copies,
    available_copies,
    description,
    image,
  } = req.body;

  // First check if the new title is already taken by another book
  const checkTitleQuery =
    "SELECT book_id FROM books WHERE title = ? AND book_id != ?";

  db.query(checkTitleQuery, [title, bookId], (err, titleResults) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (titleResults.length > 0) {
      return res
        .status(400)
        .json({ error: "Book title is already taken by another book" });
    }

    // If title is available, proceed with update
    const updateQuery = `
      UPDATE books 
      SET title = ?, author_name = ?, category = ?, published_date = ?, total_copies = ?, available_copies = ?, 
          description = ?, image = ? 
      WHERE book_id = ?
    `;

    db.query(
      updateQuery,
      [
        title,
        author_name,
        category,
        published_date,
        total_copies,
        available_copies,
        description,
        image,
        bookId,
      ],
      (err, results) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Internal Server Error" });
        }

        if (results.affectedRows === 0) {
          return res.status(404).json({ error: "Book not found" });
        }

        // Get updated book
        const getQuery = "SELECT * FROM books WHERE book_id = ?";
        db.query(getQuery, [bookId], (err, bookResults) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ error: "Internal Server Error" });
          }
          res.json(bookResults[0]);
        });
      }
    );
  });
};

// DELETE book
const deleteBook = (req, res) => {
  const bookId = req.params.id;

  // 1. Check if book is currently borrowed
  const checkQuery = "SELECT * FROM borrowed_books WHERE book_id = ?";
  db.query(checkQuery, [bookId], (err, borrowResults) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (borrowResults.length > 0) {
      return res
        .status(400)
        .json({ error: "Cannot delete book. It is currently borrowed." });
    }

    // 2. Delete book
    const deleteQuery = "DELETE FROM books WHERE book_id = ?";
    db.query(deleteQuery, [bookId], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ error: "Book not found" });
      }

      res.json({ message: "Book deleted successfully" });
    });
  });
};

// SEARCH books
const searchBooks = (req, res) => {
  const { q } = req.query;
  const query = `
    SELECT * FROM books 
    WHERE title LIKE ? OR author_name LIKE ? OR category LIKE ?
  `;
  const searchTerm = `%${q}%`;

  db.query(query, [searchTerm, searchTerm, searchTerm], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.json(results);
  });
};

module.exports = {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  searchBooks,
};
