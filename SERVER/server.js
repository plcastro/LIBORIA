require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const { connectToDatabase } = require("./config/database");

const app = express();
app.use(cors());
app.use(express.json());

// Import routes
const userRoutes = require("./routes/userRoutes");
const bookRoutes = require("./routes/bookRoutes");
const borrowerRoutes = require("./routes/borrowerRoutes");
const borrowedBookRoutes = require("./routes/borrowedBookRoutes");
const returnedBookRoutes = require("./routes/returnedBookRoutes");
const borrowRequestRoutes = require("./routes/borrowRequestRoutes");

// Use routes
app.use("/api/users", userRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/borrowers", borrowerRoutes);
app.use("/api/borrowed-books", borrowedBookRoutes);
app.use("/api/returned-books", returnedBookRoutes);
app.use("/api/records", require("./routes/recordRoutes"));
app.use("/api/borrow-requests", borrowRequestRoutes);

connectToDatabase()
  .then(() => {
    app.listen(8000, () => {
      console.log(`Server is running at http://localhost:8000`);
    });
  })
  .catch(() => {
    process.exit(1);
  });
