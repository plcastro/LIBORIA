const express = require("express");
const router = express.Router();
const returnedBookController = require("../controllers/returnedBookController");
const { authenticate, authorize } = require('../middleware/auth');
router.use(authenticate, authorize('librarian'));

// GET all returned books
router.get("/", returnedBookController.getReturnedBooks);

// GET returned book by ID
router.get("/:id", returnedBookController.getReturnedBookById);

// GET return statistics
router.get("/stats/overview", returnedBookController.getReturnStats);

// GET returns by date range
router.get("/reports/by-date", returnedBookController.getReturnsByDateRange);

// GET outstanding penalties
router.get(
  "/reports/outstanding-penalties",
  returnedBookController.getOutstandingPenalties
);

// RETURN a book (mark as returned)
router.post("/", returnedBookController.returnBook);

// UPDATE returned book record
router.put("/:id", returnedBookController.updateReturnedBook);

// DELETE returned book record
router.delete("/:id", returnedBookController.deleteReturnedBook);

module.exports = router;
