const express = require("express");
const router = express.Router();
const borrowedBookController = require("../controllers/borrowedBookController");
const { authenticate, authorize } = require('../middleware/auth');
router.use(authenticate);

router.get("/", borrowedBookController.getBorrowedBooks);
router.use(authorize('librarian'));
router.get("/:id", borrowedBookController.getBorrowedBookById);
router.get(
  "/borrower/:borrowerId",
  borrowedBookController.getBorrowedBooksByBorrower
);
router.post("/", borrowedBookController.borrowBook);
router.put("/:id", borrowedBookController.updateBorrowedBook);

module.exports = router;
