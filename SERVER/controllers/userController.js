const { collection, getNextSequence } = require("../config/database");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const mongoose = require("mongoose");
const {
  ensureBorrowerForUser,
  ensureBorrowerIndex,
} = require("../services/borrowerLink");
const { pickSelfProfileFields } = require("../services/selfProfile");
const {
  cookieName,
  sign,
  cookieOptions,
  clearCookieOptions,
} = require("../middleware/auth");

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

const getUserById = async (req, res) => {
  try {
    const userId = req.params.id || req.params._id;

    const user = await User.findById(userId)
      .select("_id username name email account_type")
      .lean();

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json(user);
  } catch (err) {
    console.error("Get user by ID error:", err);
    return res.status(500).json({
      error: "Failed to fetch user",
    });
  }
};

const updateOwnProfile = async (req, res) => {
  try {
    const { fields, error } = pickSelfProfileFields(req.body);
    if (error) return res.status(400).json({ error });

    const duplicateConditions = [];
    if (fields.username)
      duplicateConditions.push({ username: fields.username });
    if (fields.email) duplicateConditions.push({ email: fields.email });
    if (duplicateConditions.length) {
      const duplicate = await User.findOne({
        _id: { $ne: req.user.id },
        $or: duplicateConditions,
      }).select("username email");
      if (duplicate) {
        return res.status(409).json({
          error:
            duplicate.username === fields.username
              ? "Username already exists"
              : "Email already exists",
        });
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: fields },
      { new: true, runValidators: true },
    ).select("_id username name email account_type");
    if (!user) return res.status(404).json({ error: "User not found" });
    return res.json(user);
  } catch (err) {
    if (err.code === 11000)
      return res
        .status(409)
        .json({ error: "Username or email already exists" });
    if (err.name === "ValidationError")
      return res.status(400).json({ error: err.message });
    return handleError(res, err);
  }
};

const createUser = async (req, res) => {
  try {
    const { username, password, name, email, account_type } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({
        error: "Username and password are required",
      });
    }

    const existingUsername = await User.findOne({ username });

    if (existingUsername) {
      return res.status(409).json({
        error: "Username already exists",
      });
    }

    if (email) {
      const existingEmail = await User.findOne({ email });

      if (existingEmail) {
        return res.status(409).json({
          error: "Email already exists",
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userid = await getNextSequence("users");

    const user = await User.create({
      userid,
      username: username.trim(),
      password: hashedPassword,
      name: name?.trim() || null,
      email: email?.trim().toLowerCase() || null,
      account_type: ["librarian", "non-librarian"].includes(account_type)
        ? account_type
        : "librarian",
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
    console.error("MongoDB code:", err.code);
    console.error("Duplicate key pattern:", err.keyPattern);
    console.error("Duplicate key value:", err.keyValue);

    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern || {})[0];

      return res.status(409).json({
        error: `Duplicate key conflict on field: ${field || "unknown"}`,
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

const register = async (req, res) => {
  try {
    const { name, email, username, password } = req.body || {};

    if (!name?.trim() || !email?.trim() || !username?.trim() || !password) {
      return res.status(400).json({
        error: "All fields are required",
      });
    }

    const normalizedName = name.trim();
    const normalizedUsername = username.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (normalizedName.length > 50) {
      return res.status(400).json({
        error: "Name must be up to 50 characters",
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({
        error: "Invalid email format",
      });
    }

    if (normalizedUsername.length < 8) {
      return res.status(400).json({
        error: "Username must be at least 8 characters",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        error: "Password must be at least 8 characters",
      });
    }

    const duplicate = await User.findOne({
      $or: [{ username: normalizedUsername }, { email: normalizedEmail }],
    });

    if (duplicate?.username === normalizedUsername) {
      return res.status(409).json({
        error: "Username already exists",
      });
    }

    if (duplicate?.email === normalizedEmail) {
      return res.status(409).json({
        error: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await ensureBorrowerIndex();
    const session = await mongoose.startSession();
    let user;
    try {
      await session.withTransaction(async () => {
        const userid = await getNextSequence("users", session);
        [user] = await User.create(
          [
            {
              userid,
              name: normalizedName,
              email: normalizedEmail,
              username: normalizedUsername,
              password: hashedPassword,
              account_type: "student",
            },
          ],
          { session },
        );
        await ensureBorrowerForUser(user, session);
      });
    } finally {
      await session.endSession();
    }

    return res.status(201).json({
      message: "Student registration successful",
      user: {
        _id: user._id,
        userid: user.userid,
        username: user.username,
        name: user.name,
        email: user.email,
        account_type: user.account_type,
      },
    });
  } catch (err) {
    console.error("Student registration error:", err);

    if (err.code === 11000) {
      return res.status(409).json({
        error: "Username, email, or user ID already exists",
      });
    }

    if (err.name === "ValidationError") {
      return res.status(400).json({
        error: err.message,
      });
    }

    return handleError(res, err);
  }
};

const updateUser = async (req, res) => {
  try {
    const userId = toId(req.params.id);
    const { username, password, name, email, account_type } = req.body || {};
    const update = {};
    const existingUser = await User.findById(userId).select("account_type");
    if (!existingUser) return res.status(404).json({ error: "User not found" });
    if (
      account_type &&
      !["student", "non-librarian", "librarian"].includes(account_type)
    ) {
      return res.status(400).json({ error: "Invalid account type" });
    }
    if (
      account_type === "librarian" &&
      existingUser.account_type !== "librarian"
    ) {
      return res
        .status(403)
        .json({ error: "Librarian accounts must be created from Staff List" });
    }
    if (
      existingUser.account_type === "librarian" &&
      account_type &&
      account_type !== "librarian" &&
      (await User.countDocuments({ account_type: "librarian" })) <= 1
    ) {
      return res
        .status(409)
        .json({ error: "The last librarian cannot be demoted" });
    }

    if (username) update.username = username;
    if (password) update.password = await bcrypt.hash(password, 10);
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

    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      { $set: update },
      {
        new: true,
        projection: {
          _id: 0,
          _id: 1,
          username: 1,
          name: 1,
          email: 1,
          account_type: 1,
        },
      },
    );

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
    const { currPassword, newPassword } = req.body || {};

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
    const { password } = req.body || {};

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

const deleteUser = async (req, res) => {
  try {
    const userId = toId(req.params.id);
    const existingUser = await User.findById(userId).select("account_type");
    if (!existingUser) return res.status(404).json({ error: "User not found" });
    if (
      existingUser.account_type === "librarian" &&
      (await User.countDocuments({ account_type: "librarian" })) <= 1
    ) {
      return res
        .status(409)
        .json({ error: "The last librarian cannot be deleted" });
    }
    const result = await User.deleteOne({ _id: userId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    handleError(res, err);
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body || {};

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

    res.cookie(cookieName, sign(user), cookieOptions());
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

const forgotPassword = async (req, res) => {
  try {
    const email = req.body?.email?.trim().toLowerCase();

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
    console.log(user.reset_token); //testing purposes only
    await user.save();

    const isDevelopment = process.env.NODE_ENV !== "production";

    return res.json({
      message: "Recovery request submitted successfully.",
      accountExists: true,
      ...(isDevelopment
        ? { resetLink: `${process.env.CLIENT_ORIGIN}/reset/${resetToken}` }
        : {}),
    });
  } catch (err) {
    handleError(res, err);
  }
};

const verifyResetToken = async (req, res) => {
  try {
    const token = req.body?.token?.trim();

    if (!token) {
      return res.status(400).json({
        error: "Reset token is required",
      });
    }

    const user = await User.findOne({
      reset_token: token,
      reset_token_expiry: { $gt: new Date() },
    }).select("+reset_token +reset_token_expiry");

    if (!user) {
      return res.status(400).json({
        error: "Token does not match any user",
      });
    }

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

const resetPassword = async (req, res) => {
  try {
    const token = req.body?.token?.trim();
    const { newPassword } = req.body || {};

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
  me: async (req, res) => {
    const user = await User.findById(req.user.id)
      .select("_id userid username name email account_type")
      .lean();
    return user
      ? res.json({ user })
      : res.status(401).json({ error: "Session user not found" });
  },
  logout: (req, res) => {
    res.clearCookie(cookieName, clearCookieOptions());
    res.json({ message: "Logged out" });
  },
  getUsers,
  getUserById,
  updateOwnProfile,
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
