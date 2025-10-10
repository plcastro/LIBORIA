const db = require('../config/database'); // Import from config

// GET all books
const getBooks = (req, res) => {
  const query = 'SELECT * FROM books';
  
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
  const query = 'SELECT * FROM books WHERE book_id = ?';
  
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

// CREATE book
const createBook = (req, res) => {
  const { title, author_name, category, published_date, total_copies, available_copies, description, image } = req.body;
  
  if (!title || !author) {
    return res.status(400).json({ error: "Title and author are required" });
  }

  const query = `
    INSERT INTO books (title, author_name, category, published_date, total_copies, available_copies, description, image) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  db.query(query, [title, author_name, category, published_date, total_copies, available_copies, description, image], (err, results) => {
    if (err) {
      console.error(err);
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: "Book already exists" });
      }
      return res.status(500).json({ error: "Internal Server Error" });
    }
    
    // Get the newly created book
    const getQuery = 'SELECT * FROM books WHERE book_id = ?';
    db.query(getQuery, [results.insertId], (err, bookResults) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      res.status(201).json(bookResults[0]);
    });
  });
};

// UPDATE book
const updateBook = (req, res) => {
  const bookId = req.params.id;
  const { title, author_name, category, published_date, total_copies, available_copies, description, image } = req.body;
  
  const query = `
    UPDATE books 
    SET title = ?, author_name = ?, category = ?, published_date = ?, total_copies = ?, available_copies = ?, 
        description = ?, image = ? 
    WHERE book_id = ?
  `;
  
  db.query(query, [title, author_name, category, published_date, total_copies, available_copies, description, image], (err, results) => {
    if (err) {
      console.error(err);
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: "Book already exists" });
      }
      return res.status(500).json({ error: "Internal Server Error" });
    }
    
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Book not found" });
    }
    
    // Get updated book
    const getQuery = 'SELECT * FROM books WHERE book_id = ?';
    db.query(getQuery, [bookId], (err, bookResults) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      res.json(bookResults[0]);
    });
  });
};

// DELETE book
const deleteBook = (req, res) => {
  const bookId = req.params.id;
  const query = 'DELETE FROM books WHERE book_id = ?';
  
  db.query(query, [bookId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "Book not found" });
    }
    
    res.json({ message: "Book deleted successfully" });
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

module.exports = { getBooks, getBookById, createBook, updateBook, deleteBook, searchBooks };