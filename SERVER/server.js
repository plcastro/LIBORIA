const express = require("express");
const cors = require("cors");
const db = require("./config/database"); // Import from config

const app = express();
app.use(cors());
app.use(express.json());

// Import routes
const userRoutes = require("./routes/userRoutes");
const bookRoutes = require("./routes/bookRoutes");
const borrowerRoutes = require("./routes/borrowerRoutes");
const borrowedBookRoutes = require("./routes/borrowedBookRoutes");
const returnedBookRoutes = require("./routes/returnedBookRoutes");

// Use routes
app.use("/api/users", userRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/borrowers", borrowerRoutes);
app.use("/api/borrowed-books", borrowedBookRoutes);
app.use("/api/returned-books", returnedBookRoutes);
app.use("/api/records", require("./routes/recordRoutes"));

app.listen(8000, () => {
  console.log(`Server is running at http://localhost:8000`);
});
