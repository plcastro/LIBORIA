const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// Users
router.get("/", userController.getUsers);
router.get("/:id", userController.getUserById);

// Librarian dashboard creates librarian accounts
router.post("/", userController.createUser);

router.put("/:id", userController.updateUser);
router.delete("/:id", userController.deleteUser);

// Password updates
router.put("/check-pass/:id", userController.changePassword);

// Authentication
router.post("/register", userController.register);
router.post("/login", userController.login);
router.post("/forgot-password", userController.forgotPassword);
router.post("/verify-reset-token", userController.verifyResetToken);
router.post("/reset-password", userController.resetPassword);

module.exports = router;

