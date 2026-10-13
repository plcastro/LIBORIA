const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { authenticate, authorize, ownUser } = require('../middleware/auth');

// Users
router.post('/login', userController.login);
router.post('/register', userController.register);
router.post('/forgot-password', userController.forgotPassword);
router.post('/verify-reset-token', userController.verifyResetToken);
router.post('/reset-password', userController.resetPassword);
router.use(authenticate);
router.get('/me', userController.me);
router.post('/logout', userController.logout);
router.get("/", authorize('librarian'), userController.getUsers);
router.get("/:id", ownUser, userController.getUserById);

// Librarian dashboard creates librarian accounts
router.post("/", authorize('librarian'), userController.createUser);

router.put("/:id", authorize('librarian'), userController.updateUser);
router.delete("/:id", authorize('librarian'), userController.deleteUser);

// Password updates
router.put("/check-pass/:id", ownUser, userController.changePassword);

// Authentication

module.exports = router;

