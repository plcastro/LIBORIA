require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const cors = require("cors");
const { connectToDatabase } = require("./config/database");
const { authenticate } = require("./middleware/auth");

if (
  !process.env.JWT_SECRET ||
  !process.env.MONGODB_URI ||
  !process.env.CLIENT_ORIGIN
) {
  throw new Error("JWT_SECRET, MONGODB_URI, and CLIENT_ORIGIN are required");
}

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN, credentials: true }));
app.use(express.json());
app.use((req, res, next) => {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) return next();
  if (req.headers.origin && req.headers.origin !== process.env.CLIENT_ORIGIN)
    return res.status(403).json({ error: "Origin denied" });
  if (
    req.headers.cookie?.includes("liboria_session=") &&
    req.headers["x-liboria-request"] !== "1"
  )
    return res.status(403).json({ error: "Request header required" });
  next();
});

// Import routes
const userRoutes = require("./routes/userRoutes");
const bookRoutes = require("./routes/bookRoutes");
const borrowerRoutes = require("./routes/borrowerRoutes");
const borrowedBookRoutes = require("./routes/borrowedBookRoutes");
const returnedBookRoutes = require("./routes/returnedBookRoutes");
const borrowRequestRoutes = require("./routes/borrowRequestRoutes");

// Use routes
app.use("/api/users", userRoutes);
app.use("/api", authenticate);
app.use("/api/books", bookRoutes);
app.use("/api/borrowers", borrowerRoutes);
app.use("/api/borrowed-books", borrowedBookRoutes);
app.use("/api/returned-books", returnedBookRoutes);
app.use("/api/records", require("./routes/recordRoutes"));
app.use("/api/borrow-requests", borrowRequestRoutes);
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Internal Server Error" });
});

connectToDatabase()
  .then(() => {
    const port = Number(process.env.PORT || 8000);
    app.listen(port, () => {
      console.log(`Server is running at http://localhost:${port}`);
    });
  })
  .catch(() => {
    process.exit(1);
  });
