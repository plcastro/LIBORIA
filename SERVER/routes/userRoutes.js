const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// GET all users
router.get("/", userController.getUsers);

// GET user by ID
router.get("/:id", userController.getUserById);

// CREATE user (admin only)
router.post("/", userController.createUser);

// REGISTER user (public signup)
router.post("/register", userController.register);

// UPDATE user
router.put("/:id", userController.updateUser);

// UPDATE user password
router.put("/check-pass/:id", userController.updateUserPassword);
// DELETE user
router.delete("/:id", userController.deleteUser);

// LOGIN user
router.post("/login", userController.login);

// FORGOT PASSWORD - Request password reset
router.post("/forgot-password", userController.forgotPassword);

// VERIFY RESET TOKEN - Check if reset token is valid
router.post("/verify-reset-token", userController.verifyResetToken);

// RESET PASSWORD - Set new password using reset token
router.post("/reset-password", userController.resetPassword);

// GET borrowing records
router.get("/records", userController.getBorrowingRecords);

module.exports = router;
