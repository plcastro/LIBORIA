
const express = require("express");
const router = express.Router();

const {
  createRequest,
  getAllRequests,
  getStudentRequests,
  approveRequest,
  rejectRequest,
} = require("../controllers/borrowRequestController");

router.post("/", createRequest);
router.get("/", getAllRequests);
router.get("/student/:userId", getStudentRequests);
router.put("/:id/approve", approveRequest);
router.put("/:id/reject", rejectRequest);

module.exports = router;