const { collection, getNextSequence } = require("../config/database");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const User = require("../models/User");

const toId = (value) => {
  const numberValue = Number(value);
  return Number.isNaN(numberValue) ? value : numberValue;
};

const handleError = (res, err) => {
  console.error(err);
  return res.status(500).json({ error: "Internal Server Error" });
};

const findPublicUser = async (users, _id) =>
  User.findOne(
    { _id: _id },
    {
      _id: 1,

      username: 1,
      name: 1,
      email: 1,
      account_type: 1,
    },
  );

// GET all users
const getUsers = async (req, res) => {
  try {
    const results = await User.find(
      {},
      {
        _id: 1,
        username: 1,
        name: 1,
        email: 1,
        account_type: 1,
      },
    ).lean();

    res.json(results);
  } catch (err) {
    handleError(res, err);
  }
};

// GET user by ID
const getUserById = async (req, res) => {
  try {
    const user = await findPublicUser(User, toId(req.params._id));

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (err) {
    handleError(res, err);
  }
};

// CREATE user (for admin)
const createUser = async (req, res) => {
  try {
    const { username, password, name, email } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        error: "Username and password are required",
      });
    }

    // Check for duplicate username
    const existingUsername = await User.findOne({ username });

    if (existingUsername) {
      return res.status(409).json({
        error: "Username already exists",
      });
    }

    // Check for duplicate email, if provided
    if (email) {
      const existingEmail = await User.findOne({ email });

      if (existingEmail) {
        return res.status(409).json({
          error: "Email already exists",
        });
      }
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      password: hashedPassword,
      name: name || null,
      email: email || null,
      account_type: "librarian",
    });

    return res.status(201).json({
      message: "Registration successful",
      user: {
        _id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        account_type: user.account_type,
      },
    });
  } catch (err) {
    console.error("Create user error:", err);

    if (err.code === 11000) {
      return res.status(409).json({
        error: "Username or email already exists",
      });
    }

    if (err.name === "ValidationError") {
      return res.status(400).json({
        error: err.message,
      });
    }

    return res.status(500).json({
      error: "Failed to create user",
    });
  }
};

// REGISTER user (for public signup)
const register = async (req, res) => {
  try {
    const { name, email, username, password } = req.body;

    if (!name || !email || !username || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (name.length > 50) {
      return res
        .status(400)
        .json({ error: "Name must be up to 50 characters" });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    if (username.length < 8) {
      return res
        .status(400)
        .json({ error: "Username must be at least 8 characters" });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ error: "Password must be at least 8 characters" });
    }

    const normalizedUsername = username.trim();
    const normalizedEmail = email.trim().toLowerCase();

    const duplicate = await User.findOne({
      $or: [{ username: normalizedUsername }, { email: normalizedEmail }],
    });

    if (duplicate?.username === normalizedUsername) {
      return res.status(409).json({ error: "Username already exists" });
    }

    if (duplicate?.email === normalizedEmail) {
      return res.status(409).json({ error: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const _id = await getNextSequence("users");

    const user = await User.create({
      _id,
      name: name.trim(),
      email: normalizedEmail,
      username: normalizedUsername,
      password: hashedPassword,
      account_type: "librarian",
    });

    return res.status(201).json({
      message: "Registration successful",
      user: {
        _id: user._id.toString(),
        _id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        account_type: user.account_type,
      },
    });
  } catch (err) {
    console.error("Registration error:", err);

    if (err.code === 11000) {
      return res
        .status(409)
        .json({ error: "Username, email, or user ID already exists" });
    }

    return handleError(res, err);
  }
};

// UPDATE user (including account_type)
const updateUser = async (req, res) => {
  try {
    const userId = toId(req.params.id);
    const { username, password, name, email, account_type } = req.body;
    const update = {};

    if (username) update.username = username;
    if (password) update.password = password;
    if (name !== undefined) update.name = name;
    if (email !== undefined) update.email = email;
    if (account_type) update.account_type = account_type;

    if (Object.keys(update).length === 0) {
      return res.status(400).json({ error: "No fields to update" });
    }

    const duplicateConditions = [];
    if (username) duplicateConditions.push({ username });
    if (email) duplicateConditions.push({ email });

    if (duplicateConditions.length > 0) {
      const duplicate = await User.findOne({
        _id: { $ne: userId },
        $or: duplicateConditions,
      });

      if (duplicate) {
        return res
          .status(400)
          .json({ error: "Username or email already exists" });
      }
    }

    const result = await User.findOneAndUpdate(
      { _id: userId },
      { $set: update },
      {
        returnDocument: "after",
        ...{
          _id: 0,
          _id: 1,
          username: 1,
          name: 1,
          email: 1,
          account_type: 1,
        },
      },
    );
    const updatedUser = result.value || result;

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(updatedUser);
  } catch (err) {
    handleError(res, err);
  }
};

const changePassword = async (req, res) => {
  try {
    const userId = req.params.id;
    const { currPassword, newPassword } = req.body;

    if (!currPassword || !newPassword) {
      return res.status(400).json({
        error: "Both current and new passwords are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        error: "Password must be at least 8 characters",
      });
    }

    const user = await User.findById(userId).select("+password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      currPassword,
      user.password,
    );

    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        error: "Current password is incorrect",
      });
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);

    if (isSamePassword) {
      return res.status(400).json({
        error: "New password cannot be the same as the current password",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    return res.json({ message: "Password updated successfully" });
  } catch (err) {
    return handleError(res, err);
  }
};

const updateUserPassword = async (req, res) => {
  try {
    const userId = req.params.id;
    const { password } = req.body;

    if (!password || password.length < 8) {
      return res.status(400).json({
        error: "Password must be at least 8 characters",
      });
    }

    const user = await User.findById(userId).select("+password");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isSamePassword = await bcrypt.compare(password, user.password);

    if (isSamePassword) {
      return res.status(400).json({
        error: "New password cannot be the same as the current one",
      });
    }

    user.password = await bcrypt.hash(password, 10);
    await user.save();

    return res.json({ message: "Password updated successfully" });
  } catch (err) {
    return handleError(res, err);
  }
};

// DELETE user
const deleteUser = async (req, res) => {
  try {
    const result = await User.deleteOne({ _id: toId(req.params.id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    handleError(res, err);
  }
};

// LOGIN user
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        error: "Username and password are required",
      });
    }

    const normalizedUsername = username.trim();

    const user = await User.findOne({
      username: normalizedUsername,
    }).select("+password");

    if (!user || !user.password) {
      return res.status(401).json({
        error: "Incorrect username or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        error: "Incorrect username or password",
      });
    }

    return res.json({
      message: "Login successful",
      user: {
        _id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        account_type: user.account_type,
      },
    });
  } catch (err) {
    console.error("Login error:", err.message);
    handleError(res, err);
  }
};

// FORGOT PASSWORD - Generate reset token (Development version with test link)
const forgotPassword = async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        error: "No account was found with that email address.",
        accountExists: false,
      });
    }

    const resetToken = crypto.randomInt(100000, 1000000).toString();
    const resetTokenExpiry = new Date(Date.now() + 5 * 60 * 1000);

    user.reset_token = resetToken;
    user.reset_token_expiry = resetTokenExpiry;
    console.log(resetToken);
    await user.save();

    const savedUser = await User.findById(user._id).select(
      "+reset_token +reset_token_expiry",
    );

    const isDevelopment = process.env.NODE_ENV !== "production";

    return res.json({
      message: "Recovery request submitted successfully.",
      accountExists: true,
      ...(isDevelopment
        ? { resetLink: `http://localhost:3000/reset-password/${resetToken}` }
        : {}),
    });
  } catch (err) {
    handleError(res, err);
  }
};

// VERIFY RESET TOKEN - Check if token is valid
const verifyResetToken = async (req, res) => {
  try {
    const token = req.body.token?.trim();

    if (!token) {
      return res.status(400).json({
        error: "Reset token is required",
      });
    }
    console.log("Submitted token length:", token.length);
    console.log("Current time:", new Date());

    const user = await User.findOne({
      reset_token: token,
    }).select("+reset_token +reset_token_expiry");

    if (!user) {
      console.log("Token exists in database:", false);

      return res.status(400).json({
        error: "Token does not match any user",
      });
    }
    console.log("Token exists in database:", true);
    console.log("Token matches:", user.reset_token === token);
    console.log("Token expiry:", user.reset_token_expiry);
    console.log("Token expired:", user.reset_token_expiry <= new Date());
    return res.json({
      message: "Token is valid",
      user: {
        _id: user._id,
        username: user.username,
      },
    });
  } catch (err) {
    handleError(res, err);
  }
};

// RESET PASSWORD - Update password using reset token
const resetPassword = async (req, res) => {
  try {
    const token = req.body.token?.trim();
    const { newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        error: "Token and new password are required",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        error: "Password must be at least 8 characters",
      });
    }

    const user = await User.findOne({
      reset_token: token,
      reset_token_expiry: { $gt: new Date() },
    }).select("+password +reset_token +reset_token_expiry");

    if (!user) {
      return res.status(400).json({
        error: "Invalid or expired reset token",
      });
    }

    const isSamePassword = await bcrypt.compare(newPassword, user.password);

    if (isSamePassword) {
      return res.status(400).json({
        error: "New password cannot be the same as your current password.",
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.reset_token = null;
    user.reset_token_expiry = null;

    await user.save();

    return res.json({
      message: "Password reset successfully",
    });
  } catch (err) {
    return handleError(res, err);
  }
};

// GET all borrowing records with related data
const getBorrowingRecords = async (req, res) => {
  try {
    const borrowedBooks = await collection("borrowed_books");
    const results = await borrowedBooks
      .aggregate([
        {
          $lookup: {
            from: "borrowers",
            localField: "borrower_id",
            foreignField: "borrower_id",
            as: "borrower",
          },
        },
        {
          $lookup: {
            from: "books",
            localField: "book_id",
            foreignField: "book_id",
            as: "book",
          },
        },
        {
          $lookup: {
            from: "returned_books",
            localField: "borrow_id",
            foreignField: "borrow_id",
            as: "returnRecord",
          },
        },
        { $unwind: { path: "$borrower", preserveNullAndEmptyArrays: true } },
        { $unwind: { path: "$book", preserveNullAndEmptyArrays: true } },
        {
          $unwind: { path: "$returnRecord", preserveNullAndEmptyArrays: true },
        },
        { $sort: { date_borrowed: -1 } },
        {
          $project: {
            _id: 0,
            borrow_id: 1,
            borrower_name: "$borrower.name",
            year_level: "$borrower.year_level",
            course: "$borrower.course",
            book_title: "$book.title",
            date_borrowed: 1,
            due_date: 1,
            returned_date: "$returnRecord.returned_date",
            violation: { $ifNull: ["$returnRecord.violation", "None"] },
            penalty: { $ifNull: ["$returnRecord.penalty", 0] },
            status: 1,
          },
        },
      ])
      .toArray();

    res.json(results);
  } catch (err) {
    handleError(res, err);
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  register,
  updateUserPassword,
  changePassword,
  updateUser,
  deleteUser,
  login,
  forgotPassword,
  verifyResetToken,
  resetPassword,
  getBorrowingRecords,
};
