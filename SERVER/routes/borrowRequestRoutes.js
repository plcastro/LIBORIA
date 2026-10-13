
const express = require("express");
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
router.use(authenticate);

const {
  createRequest,
  getAllRequests,
  getStudentRequests,
  getStudentLimit,
  approveRequest,
  rejectRequest,
} = require("../controllers/borrowRequestController");

router.post("/", authorize('student', 'non-librarian'), (req, res, next) => {
  if (String(req.body.user_id) !== req.user.id) return res.status(403).json({ error: 'Access denied' });
  next();
}, createRequest);
router.get("/", authorize('librarian'), getAllRequests);
router.get("/limit", authorize('student', 'non-librarian'), getStudentLimit);
router.get("/student/:userId", authorize('student', 'non-librarian'), (req, res, next) => req.params.userId === req.user.id ? next() : res.status(403).json({ error: 'Access denied' }), getStudentRequests);
router.put("/:id/approve", authorize('librarian'), approveRequest);
router.put("/:id/reject", authorize('librarian'), rejectRequest);

module.exports = router;
