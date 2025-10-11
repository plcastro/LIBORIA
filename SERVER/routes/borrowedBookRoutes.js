const express = require("express");
const router = express.Router();
const borrowedBookController = require("../controllers/borrowedBookController");

router.get("/", borrowedBookController.getBorrowedBooks);
router.get("/:id", borrowedBookController.getBorrowedBookById);
router.get(
  "/borrower/:borrowerId",
  borrowedBookController.getBorrowedBooksByBorrower
);
router.post("/", borrowedBookController.borrowBook);
router.put("/:id", borrowedBookController.updateBorrowedBook);

module.exports = router;
