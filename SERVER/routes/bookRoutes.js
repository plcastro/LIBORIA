const express = require("express");
const router = express.Router();
const bookController = require("../controllers/bookController");
const { authenticate, authorize } = require('../middleware/auth');
router.use(authenticate);

router.get("/", bookController.getBooks);
router.get("/search", bookController.searchBooks);
router.get("/:id", bookController.getBookById);
router.post("/", authorize('librarian'), bookController.createBook);
router.put("/:id", authorize('librarian'), bookController.updateBook);
router.delete("/:id", authorize('librarian'), bookController.deleteBook);

module.exports = router;
