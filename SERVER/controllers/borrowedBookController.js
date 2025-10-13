const db = require("../config/database");

// GET all borrowed books with details
const getBorrowedBooks = (req, res) => {
  const query = `
    SELECT 
      bb.borrow_id,
      bb.borrower_id,
      bb.book_id,
      bb.date_borrowed,
      bb.due_date,
      bb.status,
      bb.created_at,
      b.title,
      b.author_name,
      bor.name as borrower_name,
      bor.year_level,
      bor.course
    FROM borrowed_books bb
    JOIN books b ON bb.book_id = b.book_id
    JOIN borrowers bor ON bb.borrower_id = bor.borrower_id
    ORDER BY bb.date_borrowed DESC
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
    SELECT 
      bb.*, 
      b.title, 
      b.author_name, 
      bor.name as borrower_name,
      bor.year_level,
      bor.course
    FROM borrowed_books bb
    JOIN books b ON bb.book_id = b.book_id
    JOIN borrowers bor ON bb.borrower_id = bor.borrower_id
    WHERE bb.borrow_id = ?
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

// BORROW a book with all validations
const borrowBook = (req, res) => {
  const { book_id, borrower_id, due_date } = req.body;

  if (!book_id || !borrower_id || !due_date) {
    return res.status(400).json({
      error: "Book ID, borrower ID, and due date are required",
    });
  }

  // Start transaction
  db.beginTransaction((err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    // Check 1: Book availability
    const checkBookQuery = `
      SELECT available_copies, total_copies, title 
      FROM books 
      WHERE book_id = ? AND available_copies > 0
    `;

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

      // Check 2: If user already borrowed this book (active borrow)
      const checkDuplicateQuery = `
        SELECT borrow_id 
        FROM borrowed_books 
        WHERE book_id = ? AND borrower_id = ? AND status = 'Borrowed'
      `;

      db.query(
        checkDuplicateQuery,
        [book_id, borrower_id],
        (err, duplicateResults) => {
          if (err) {
            return db.rollback(() => {
              console.error(err);
              res.status(500).json({ error: "Internal Server Error" });
            });
          }

          if (duplicateResults.length > 0) {
            return db.rollback(() => {
              res
                .status(400)
                .json({ error: "You have already borrowed this book" });
            });
          }

          // Check 3: User borrow limit (3 books)
          const checkLimitQuery = `
          SELECT COUNT(*) as active_borrows 
          FROM borrowed_books 
          WHERE borrower_id = ? AND status = 'Borrowed'
        `;

          db.query(checkLimitQuery, [borrower_id], (err, limitResults) => {
            if (err) {
              return db.rollback(() => {
                console.error(err);
                res.status(500).json({ error: "Internal Server Error" });
              });
            }

            if (limitResults[0].active_borrows >= 3) {
              return db.rollback(() => {
                res.status(400).json({
                  error:
                    "Borrow limit reached. You can only borrow up to 3 books at a time.",
                });
              });
            }

            // All checks passed - proceed with borrowing
            const borrowQuery = `
            INSERT INTO borrowed_books (book_id, borrower_id, date_borrowed, due_date, status) 
            VALUES (?, ?, CURDATE(), ?, 'Borrowed')
          `;

            db.query(
              borrowQuery,
              [book_id, borrower_id, due_date],
              (err, borrowResults) => {
                if (err) {
                  return db.rollback(() => {
                    console.error(err);
                    res.status(500).json({ error: "Internal Server Error" });
                  });
                }

                // Update book available copies
                const updateBookQuery = `
              UPDATE books 
              SET available_copies = available_copies - 1 
              WHERE book_id = ?
            `;

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
                        res
                          .status(500)
                          .json({ error: "Internal Server Error" });
                      });
                    }

                    // Return success with borrow details
                    const getBorrowQuery = `
                  SELECT 
                    bb.*, 
                    b.title, 
                    b.author_name, 
                    bor.name as borrower_name,
                    bor.year_level,
                    bor.course
                  FROM borrowed_books bb
                  JOIN books b ON bb.book_id = b.book_id
                  JOIN borrowers bor ON bb.borrower_id = bor.borrower_id
                  WHERE bb.borrow_id = ?
                `;

                    db.query(
                      getBorrowQuery,
                      [borrowResults.insertId],
                      (err, finalResults) => {
                        if (err) {
                          console.error(err);
                          return res
                            .status(500)
                            .json({ error: "Internal Server Error" });
                        }

                        res.status(201).json({
                          message: "Book borrowed successfully",
                          borrowRecord: finalResults[0],
                        });
                      }
                    );
                  });
                });
              }
            );
          });
        }
      );
    });
  });
};

// UPDATE borrowed book (extend due date, update status, etc.)
const updateBorrowedBook = (req, res) => {
  const borrowId = req.params.id;
  const { status } = req.body;

  const query = `
    UPDATE borrowed_books 
    SET status = ?
    WHERE borrow_id = ?
  `;

  db.query(query, [status, borrowId], (err, results) => {
    if (err) {
      console.error("Error updating borrowed_books:", err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Borrow record not found" });
    }

    // Fetch updated record for response
    const getQuery = `
      SELECT 
        bb.*, 
        b.title, 
        b.author_name, 
        bor.name as borrower_name
      FROM borrowed_books bb
      JOIN books b ON bb.book_id = b.book_id
      JOIN borrowers bor ON bb.borrower_id = bor.borrower_id
      WHERE bb.borrow_id = ?
    `;

    db.query(getQuery, [borrowId], (err, borrowResults) => {
      if (err) {
        console.error("Error fetching updated borrow record:", err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      res.json({
        message: "Borrowed book status updated successfully",
        updatedRecord: borrowResults[0],
      });
    });
  });
};

// GET currently borrowed books by borrower
const getBorrowedBooksByBorrower = (req, res) => {
  const borrowerId = req.params.borrowerId;

  const query = `
    SELECT 
      bb.*, 
      b.title, 
      b.author_name
    FROM borrowed_books bb
    JOIN books b ON bb.book_id = b.book_id
    WHERE bb.borrower_id = ? AND bb.status = 'Borrowed'
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

// GET active borrowed books count for a borrower
const getActiveBorrowsCount = (req, res) => {
  const borrowerId = req.params.borrowerId;

  const query = `
    SELECT COUNT(*) as active_borrows 
    FROM borrowed_books 
    WHERE borrower_id = ? AND status = ''
  `;

  db.query(query, [borrowerId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.json(results[0]);
  });
};

module.exports = {
  getBorrowedBooks,
  getBorrowedBookById,
  borrowBook,
  updateBorrowedBook,
  getBorrowedBooksByBorrower,
  getActiveBorrowsCount,
};
