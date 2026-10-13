const express = require("express");
const router = express.Router();
const recordController = require("../controllers/recordController");
const { authenticate, authorize } = require('../middleware/auth');
router.use(authenticate, authorize('librarian'));

router.get("/", recordController.getAllRecords);

module.exports = router;
