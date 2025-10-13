const db = require("../config/database");

// GET all borrowing and return records (combined view)
const getAllRecords = (req, res) => {
  const query = `
    SELECT 
      bb.borrow_id,
      bb.borrower_id,
      bb.book_id,
      bb.date_borrowed,
      bb.due_date,
      bb.status,
      bb.created_at,
      b.title AS book_title,
      b.author_name,
      bor.name AS borrower_name,
      bor.year_level,
      bor.course,
      rb.returned_date,
      rb.violation,
      rb.penalty,
      rb.amount_paid
    FROM borrowed_books bb
    JOIN books b ON bb.book_id = b.book_id
    JOIN borrowers bor ON bb.borrower_id = bor.borrower_id
    LEFT JOIN returned_books rb ON bb.borrow_id = rb.borrow_id
    ORDER BY bb.date_borrowed DESC, rb.returned_date DESC
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
  getAllRecords,
};
