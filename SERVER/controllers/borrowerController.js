const db = require("../config/database"); // Import from config

// GET all borrowers
const getBorrowers = (req, res) => {
  const query = "SELECT * FROM borrowers";

  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.json(results);
  });
};

// GET borrower by ID
const getBorrowerById = (req, res) => {
  const borrowerId = req.params.id;
  const query = "SELECT * FROM borrowers WHERE borrower_id = ?";

  db.query(query, [borrowerId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "Borrower not found" });
    }

    res.json(results[0]);
  });
};

// CREATE borrower
const createBorrower = (req, res) => {
  const { name, year_level, course, created_at } = req.body;

  if (!name || !year_level || !course) {
    return res
      .status(400)
      .json({ error: "Name, Year Level, and Course are all required" });
  }

  // Check if borrower already exists
  const checkQuery = "SELECT * FROM borrowers WHERE LOWER(name) = LOWER(?)";
  db.query(checkQuery, [name], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (results.length > 0) {
      return res.status(400).json({ error: "Borrower already exists" });
    }

    // Insert new borrower
    const insertQuery = `
      INSERT INTO borrowers (name, year_level, course, created_at)
      VALUES (?, ?, ?, ?)
    `;
    db.query(
      insertQuery,
      [name, year_level, course, created_at],
      (err, insertResult) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Internal Server Error" });
        }

        // Retrieve and return the newly created borrower
        const getQuery = "SELECT * FROM borrowers WHERE borrower_id = ?";
        db.query(getQuery, [insertResult.insertId], (err, borrowerResults) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ error: "Internal Server Error" });
          }
          res.status(201).json(borrowerResults[0]);
        });
      }
    );
  });
};

// UPDATE borrower
const updateBorrower = (req, res) => {
  const borrowerId = req.params.id;
  const { name, year_level, course, created_at } = req.body;

  const query = `
    UPDATE borrowers 
    SET name = ?, year_level = ?, course = ?
    WHERE borrower_id = ?
  `;

  db.query(query, [name, year_level, course], (err, results) => {
    if (err) {
      console.error(err);
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(400).json({ error: "Borrower already exists" });
      }
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Borrower not found" });
    }

    // Get updated borrower
    const getQuery = "SELECT * FROM borrowers WHERE borrower_id = ?";
    db.query(getQuery, [borrowerId], (err, borrowerResults) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      res.json(borrowerResults[0]);
    });
  });
};

// DELETE borrower
const deleteBorrower = (req, res) => {
  const borrowerId = req.params.id;
  const query = "DELETE FROM borrowers WHERE borrower_id = ?";

  db.query(query, [borrowerId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Borrower not found" });
    }

    res.json({ message: "Borrower deleted successfully" });
  });
};

module.exports = {
  getBorrowers,
  getBorrowerById,
  createBorrower,
  updateBorrower,
  deleteBorrower,
};
