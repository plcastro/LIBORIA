const db = require("../config/database"); // Import from config

// GET all returned books with details
const getReturnedBooks = (req, res) => {
  const query = `
    SELECT rb.*, 
           bb.borrow_id, bb.book_id, bb.borrower_id,
           b.title, b.author, b.isbn,
           bor.first_name, bor.last_name, bor.email,
           bb.borrowed_date, bb.due_date
    FROM returned_books rb
    JOIN borrowed_books bb ON rb.borrow_id = bb.borrow_id
    JOIN books b ON bb.book_id = b.id
    JOIN borrowers bor ON bb.borrower_id = bor.id
    ORDER BY rb.returned_date DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.json(results);
  });
};

// GET returned book by ID
const getReturnedBookById = (req, res) => {
  const returnId = req.params.id;
  const query = `
    SELECT rb.*, 
           bb.borrow_id, bb.book_id, bb.borrower_id,
           b.title, b.author, b.isbn,
           bor.first_name, bor.last_name, bor.email, bor.phone,
           bb.borrowed_date, bb.due_date, bb.notes as borrow_notes
    FROM returned_books rb
    JOIN borrowed_books bb ON rb.borrow_id = bb.borrow_id
    JOIN books b ON bb.book_id = b.id
    JOIN borrowers bor ON bb.borrower_id = bor.id
    WHERE rb.return_id = ?
  `;

  db.query(query, [returnId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Return record not found" });
    }

    res.json(results[0]);
  });
};

// RETURN a book (mark as returned)
const returnBook = (req, res) => {
  const { borrow_id, violation, penalty, amount_paid } = req.body;

  if (!borrow_id) {
    return res.status(400).json({ error: "Borrow ID is required" });
  }

  // Start transaction
  db.beginTransaction((err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    // Step 1: Get borrow record details
    const getBorrowQuery = `
      SELECT bb.*, b.title, b.id as book_id, bor.first_name, bor.last_name 
      FROM borrowed_books bb
      JOIN books b ON bb.book_id = b.id
      JOIN borrowers bor ON bb.borrower_id = bor.id
      WHERE bb.borrow_id = ? AND bb.status = 'borrowed'
    `;

    db.query(getBorrowQuery, [borrow_id], (err, borrowResults) => {
      if (err) {
        return db.rollback(() => {
          console.error(err);
          res.status(500).json({ error: "Internal Server Error" });
        });
      }

      if (borrowResults.length === 0) {
        return db.rollback(() => {
          res.status(404).json({ error: "Active borrow record not found" });
        });
      }

      const borrowRecord = borrowResults[0];

      // Step 2: Create return record
      const returnQuery = `
        INSERT INTO returned_books 
        (borrow_id, returned_date, violation, penalty, amount_paid) 
        VALUES (?, CURDATE(), ?, ?, ?)
      `;

      db.query(
        returnQuery,
        [borrow_id, violation || "None", penalty || 0.0, amount_paid || 0.0],
        (err, returnResults) => {
          if (err) {
            return db.rollback(() => {
              console.error(err);
              res.status(500).json({ error: "Internal Server Error" });
            });
          }

          // Step 3: Update borrow record status to 'returned'
          const updateBorrowQuery = `
          UPDATE borrowed_books 
          SET status = 'returned', returned_date = CURDATE() 
          WHERE borrow_id = ?
        `;
          db.query(updateBorrowQuery, [borrow_id], (err, updateResults) => {
            if (err) {
              return db.rollback(() => {
                console.error(err);
                res.status(500).json({ error: "Internal Server Error" });
              });
            }

            // Step 4: Update book available copies (+1)
            const updateBookQuery =
              "UPDATE books SET available_copies = available_copies + 1 WHERE id = ?";
            db.query(
              updateBookQuery,
              [borrowRecord.book_id],
              (err, bookResults) => {
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

                  // Get the complete return record with details
                  const getQuery = `
                SELECT rb.*, 
                       bb.book_id, bb.borrower_id,
                       b.title, b.author, b.isbn,
                       bor.first_name, bor.last_name, bor.email,
                       bb.borrowed_date, bb.due_date
                FROM returned_books rb
                JOIN borrowed_books bb ON rb.borrow_id = bb.borrow_id
                JOIN books b ON bb.book_id = b.id
                JOIN borrowers bor ON bb.borrower_id = bor.id
                WHERE rb.return_id = ?
              `;
                  db.query(
                    getQuery,
                    [returnResults.insertId],
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
              }
            );
          });
        }
      );
    });
  });
};

// UPDATE returned book record
const updateReturnedBook = (req, res) => {
  const returnId = req.params.id;
  const { violation, penalty, amount_paid } = req.body;

  const query = `
    UPDATE returned_books 
    SET violation = ?, penalty = ?, amount_paid = ? 
    WHERE return_id = ?
  `;

  db.query(
    query,
    [violation, penalty, amount_paid, returnId],
    (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal Server Error" });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ error: "Return record not found" });
      }

      // Get updated record
      const getQuery = `
      SELECT rb.*, 
             b.title, b.author,
             bor.first_name, bor.last_name
      FROM returned_books rb
      JOIN borrowed_books bb ON rb.borrow_id = bb.borrow_id
      JOIN books b ON bb.book_id = b.id
      JOIN borrowers bor ON bb.borrower_id = bor.id
      WHERE rb.return_id = ?
    `;
      db.query(getQuery, [returnId], (err, returnResults) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Internal Server Error" });
        }
        res.json(returnResults[0]);
      });
    }
  );
};

// DELETE returned book record
const deleteReturnedBook = (req, res) => {
  const returnId = req.params.id;

  // Start transaction to maintain data consistency
  db.beginTransaction((err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    // First, get the return record to know which borrow record and book to update
    const getReturnQuery = "SELECT * FROM returned_books WHERE return_id = ?";
    db.query(getReturnQuery, [returnId], (err, returnResults) => {
      if (err) {
        return db.rollback(() => {
          console.error(err);
          res.status(500).json({ error: "Internal Server Error" });
        });
      }

      if (returnResults.length === 0) {
        return db.rollback(() => {
          res.status(404).json({ error: "Return record not found" });
        });
      }

      const returnRecord = returnResults[0];

      // Step 1: Update borrow record back to 'borrowed'
      const updateBorrowQuery = `
        UPDATE borrowed_books 
        SET status = 'borrowed', returned_date = NULL 
        WHERE borrow_id = ?
      `;
      db.query(
        updateBorrowQuery,
        [returnRecord.borrow_id],
        (err, updateResults) => {
          if (err) {
            return db.rollback(() => {
              console.error(err);
              res.status(500).json({ error: "Internal Server Error" });
            });
          }

          // Step 2: Update book available copies (-1)
          const getBookQuery =
            "SELECT book_id FROM borrowed_books WHERE borrow_id = ?";
          db.query(
            getBookQuery,
            [returnRecord.borrow_id],
            (err, bookResults) => {
              if (err) {
                return db.rollback(() => {
                  console.error(err);
                  res.status(500).json({ error: "Internal Server Error" });
                });
              }

              if (bookResults.length === 0) {
                return db.rollback(() => {
                  res.status(404).json({ error: "Book not found" });
                });
              }

              const updateBookQuery =
                "UPDATE books SET available_copies = available_copies - 1 WHERE id = ?";
              db.query(
                updateBookQuery,
                [bookResults[0].book_id],
                (err, bookUpdateResults) => {
                  if (err) {
                    return db.rollback(() => {
                      console.error(err);
                      res.status(500).json({ error: "Internal Server Error" });
                    });
                  }

                  // Step 3: Delete the return record
                  const deleteQuery =
                    "DELETE FROM returned_books WHERE return_id = ?";
                  db.query(deleteQuery, [returnId], (err, deleteResults) => {
                    if (err) {
                      return db.rollback(() => {
                        console.error(err);
                        res
                          .status(500)
                          .json({ error: "Internal Server Error" });
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

                      res.json({
                        message: "Return record deleted successfully",
                      });
                    });
                  });
                }
              );
            }
          );
        }
      );
    });
  });
};

// GET return statistics
const getReturnStats = (req, res) => {
  const query = `
    SELECT 
      COUNT(*) as total_returns,
      SUM(penalty) as total_penalties,
      SUM(amount_paid) as total_amount_paid,
      violation,
      COUNT(*) as count_by_violation
    FROM returned_books 
    GROUP BY violation
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.json(results);
  });
};

// GET returns by date range
const getReturnsByDateRange = (req, res) => {
  const { start_date, end_date } = req.query;

  if (!start_date || !end_date) {
    return res
      .status(400)
      .json({ error: "Start date and end date are required" });
  }

  const query = `
    SELECT rb.*, 
           b.title, b.author,
           bor.first_name, bor.last_name
    FROM returned_books rb
    JOIN borrowed_books bb ON rb.borrow_id = bb.borrow_id
    JOIN books b ON bb.book_id = b.id
    JOIN borrowers bor ON bb.borrower_id = bor.id
    WHERE rb.returned_date BETWEEN ? AND ?
    ORDER BY rb.returned_date DESC
  `;

  db.query(query, [start_date, end_date], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.json(results);
  });
};

// GET outstanding penalties (where penalty > amount_paid)
const getOutstandingPenalties = (req, res) => {
  const query = `
    SELECT rb.*, 
           b.title, b.author,
           bor.first_name, bor.last_name, bor.email
    FROM returned_books rb
    JOIN borrowed_books bb ON rb.borrow_id = bb.borrow_id
    JOIN books b ON bb.book_id = b.id
    JOIN borrowers bor ON bb.borrower_id = bor.id
    WHERE rb.penalty > rb.amount_paid
    ORDER BY (rb.penalty - rb.amount_paid) DESC
  `;

  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.json(results);
  });
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
