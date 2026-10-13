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

const allowedOrigins = process.env.CLIENT_ORIGIN.split(",")
  .map((origin) => origin.trim().replace(/\/+$/, ""))
  .filter(Boolean);

const isAllowedOrigin = (origin) => {
  if (!origin) return true;

  return allowedOrigins.includes(origin.replace(/\/+$/, ""));
};

// CORS configuration
app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) {
        return callback(null, true);
      }

      console.error("Origin denied by CORS:", origin);

      return callback(new Error("Origin denied by CORS"));
    },
    credentials: true,
    methods: ["GET", "HEAD", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Liboria-Request"],
  }),
);

app.use(express.json());

// Validate non-GET requests
app.use((req, res, next) => {
  if (["GET", "HEAD", "OPTIONS"].includes(req.method)) {
    return next();
  }

  if (!isAllowedOrigin(req.headers.origin)) {
    console.error("Request origin denied:", req.headers.origin);

    return res.status(403).json({
      error: "Origin denied",
    });
  }

  // Require the custom header for requests carrying the session cookie.
  if (
    req.headers.cookie?.includes("liboria_session=") &&
    req.headers["x-liboria-request"] !== "1"
  ) {
    return res.status(403).json({
      error: "Request header required",
    });
  }

  next();
});

// Import routes
const userRoutes = require("./routes/userRoutes");
const bookRoutes = require("./routes/bookRoutes");
const borrowerRoutes = require("./routes/borrowerRoutes");
const borrowedBookRoutes = require("./routes/borrowedBookRoutes");
const returnedBookRoutes = require("./routes/returnedBookRoutes");
const borrowRequestRoutes = require("./routes/borrowRequestRoutes");

// Public user routes, including login and signup
app.use("/api/users", userRoutes);

// Authentication for the remaining API routes
app.use("/api", authenticate);

app.use("/api/books", bookRoutes);
app.use("/api/borrowers", borrowerRoutes);
app.use("/api/borrowed-books", borrowedBookRoutes);
app.use("/api/returned-books", returnedBookRoutes);
app.use("/api/records", require("./routes/recordRoutes"));
app.use("/api/borrow-requests", borrowRequestRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error("Server error:", err.message);

  if (res.headersSent) {
    return next(err);
  }

  if (err.message === "Origin denied by CORS") {
    return res.status(403).json({
      error: "Origin denied by CORS",
    });
  }

  return res.status(500).json({
    error: "Internal Server Error",
  });
});

// Connect to MongoDB and start the server
connectToDatabase()
  .then(() => {
    const port = Number(process.env.PORT || 8000);

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
      console.log("Allowed frontend origins:", allowedOrigins);
    });
  })
  .catch((err) => {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  });

module.exports = app;
