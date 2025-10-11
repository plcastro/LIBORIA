const db = require("../config/database"); // Import from config

// GET all borrowed books with details
const getBorrowedBooks = (req, res) => {
  const query = `
    SELECT borrow_id, borrower_id, book_id, date_borrowed, due_date, status, created_at
    ORDER BY date_borrowed DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.json(results);
  });
};

// GET borrowed book by ID
const getBorrowedBookById = (req, res) => {
  const borrowId = req.params.id;
  const query = `
    SELECT bb.*, b.title, b.author, b.isbn, bor.first_name, bor.last_name, bor.email, bor.phone
    FROM borrowed_books bb
    JOIN books b ON bb.book_id = b.id
    JOIN borrowers bor ON bb.borrower_id = bor.id
    WHERE bb.id = ?
  `;

  db.query(query, [borrowId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Borrow record not found" });
    }

    res.json(results[0]);
  });
};

// BORROW a book
const borrowBook = (req, res) => {
  const { book_id, borrower_id, due_date, notes } = req.body;

  if (!book_id || !borrower_id || !due_date) {
    return res
      .status(400)
      .json({ error: "Book ID, borrower ID, and due date are required" });
  }

  // Start transaction
  db.beginTransaction((err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    // Check if book is available
    const checkBookQuery =
      "SELECT available_copies FROM books WHERE id = ? AND available_copies > 0";
    db.query(checkBookQuery, [book_id], (err, bookResults) => {
      if (err) {
        return db.rollback(() => {
          console.error(err);
          res.status(500).json({ error: "Internal Server Error" });
        });
      }

      if (bookResults.length === 0) {
        return db.rollback(() => {
          res.status(400).json({ error: "Book not available for borrowing" });
        });
      }

      // Create borrow record
      const borrowQuery = `
        INSERT INTO borrowed_books (book_id, borrower_id, borrowed_date, due_date, notes) 
        VALUES (?, ?, CURDATE(), ?, ?)
      `;

      db.query(
        borrowQuery,
        [book_id, borrower_id, due_date, notes],
        (err, borrowResults) => {
          if (err) {
            return db.rollback(() => {
              console.error(err);
              res.status(500).json({ error: "Internal Server Error" });
            });
          }

          // Update book available copies
          const updateBookQuery =
            "UPDATE books SET available_copies = available_copies - 1 WHERE id = ?";
          db.query(updateBookQuery, [book_id], (err, updateResults) => {
            if (err) {
              return db.rollback(() => {
                console.error(err);
                res.status(500).json({ error: "Internal Server Error" });
              });
            }

            // Commit transaction
            db.commit((err) => {
              if (err) {
                return db.rollback(() => {
                  console.error(err);
                  res.status(500).json({ error: "Internal Server Error" });
                });
              }

              // Get the new borrow record with details
              const getQuery = `
              SELECT bb.*, b.title, b.author, bor.first_name, bor.last_name
              FROM borrowed_books bb
              JOIN books b ON bb.book_id = b.id
              JOIN borrowers bor ON bb.borrower_id = bor.id
              WHERE bb.id = ?
            `;
              db.query(
                getQuery,
                [borrowResults.insertId],
                (err, finalResults) => {
                  if (err) {
                    console.error(err);
                    return res
                      .status(500)
                      .json({ error: "Internal Server Error" });
                  }
                  res.status(201).json(finalResults[0]);
                }
              );
            });
          });
        }
      );
    });
  });
};

// UPDATE borrowed book (extend due date, update status, etc.)
const updateBorrowedBook = (req, res) => {
  const borrowId = req.params.id;
  const { due_date, status, fine_amount, notes } = req.body;

  const query = `
    UPDATE borrowed_books 
    SET due_date = ?, status = ?, fine_amount = ?, notes = ? 
    WHERE id = ?
  `;

  db.query(
    query,
    [due_date, status, fine_amount, notes, borrowId],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ error: "Borrow record not found" });
      }

      // Get updated record
      const getQuery = `
      SELECT bb.*, b.title, b.author, bor.first_name, bor.last_name
      FROM borrowed_books bb
      JOIN books b ON bb.book_id = b.id
      JOIN borrowers bor ON bb.borrower_id = bor.id
      WHERE bb.id = ?
    `;
      db.query(getQuery, [borrowId], (err, borrowResults) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Internal Server Error" });
        }
        res.json(borrowResults[0]);
      });
    }
  );
};

// GET currently borrowed books by borrower
const getBorrowedBooksByBorrower = (req, res) => {
  const borrowerId = req.params.borrowerId;
  const query = `
    SELECT bb.*, b.title, b.author, b.isbn
    FROM borrowed_books bb
    JOIN books b ON bb.book_id = b.id
    WHERE bb.borrower_id = ? AND bb.status = 'borrowed'
    ORDER BY bb.due_date ASC
  `;

  db.query(query, [borrowerId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.json(results);
  });
};

module.exports = {
  getBorrowedBooks,
  getBorrowedBookById,
  borrowBook,
  updateBorrowedBook,
  getBorrowedBooksByBorrower,
};
