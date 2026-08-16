const { collection, getNextSequence } = require("../config/database");
const crypto = require("crypto");

const toId = (value) => {
  const numberValue = Number(value);
  return Number.isNaN(numberValue) ? value : numberValue;
};

const publicUserProjection = {
  projection: {
    _id: 0,
    userid: 1,
    username: 1,
    name: 1,
    email: 1,
    account_type: 1,
  },
};

const handleError = (res, err) => {
  console.error(err);
  return res.status(500).json({ error: "Internal Server Error" });
};

const findPublicUser = async (users, userid) =>
  users.findOne({ userid }, publicUserProjection);

// GET all users
const getUsers = async (req, res) => {
  try {
    const users = await collection("users");
    const results = await users.find({}, publicUserProjection).toArray();
    res.json(results);
  } catch (err) {
    handleError(res, err);
  }
};

// GET user by ID
const getUserById = async (req, res) => {
  try {
    const users = await collection("users");
    const user = await findPublicUser(users, toId(req.params.id));

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
    const { username, password, name, email, account_type } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required" });
    }

    const users = await collection("users");
    const duplicate = await users.findOne({
      $or: [{ username }, ...(email ? [{ email }] : [])],
    });

    if (duplicate?.username === username) {
      return res.status(400).json({ error: "Username already exists" });
    }

    if (email && duplicate?.email === email) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const userid = await getNextSequence("users");
    await users.insertOne({
      userid,
      username,
      password,
      name: name || null,
      email: email || null,
      account_type: account_type || "librarian",
      created_at: new Date(),
    });

    res.status(201).json(await findPublicUser(users, userid));
  } catch (err) {
    handleError(res, err);
  }
};

// REGISTER user (for public signup)
const register = async (req, res) => {
  try {
    const { name, email, username, password } = req.body;

    console.log("Registration attempt:", { name, email, username });

    if (!name || !email || !username || !password) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (name.length > 50) {
      return res.status(400).json({ error: "Name must be up to 50 characters" });
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

    const users = await collection("users");
    const duplicate = await users.findOne({ $or: [{ username }, { email }] });

    if (duplicate?.username === username) {
      return res.status(400).json({ error: "Username already exists" });
    }

    if (duplicate?.email === email) {
      return res.status(400).json({ error: "Email already exists" });
    }

    const userid = await getNextSequence("users");
    await users.insertOne({
      userid,
      name,
      email,
      username,
      password,
      account_type: "librarian",
      created_at: new Date(),
    });

    res.status(201).json({
      message: "Registration successful",
      user: await findPublicUser(users, userid),
    });
  } catch (err) {
    handleError(res, err);
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

    const users = await collection("users");
    const duplicateConditions = [];
    if (username) duplicateConditions.push({ username });
    if (email) duplicateConditions.push({ email });

    if (duplicateConditions.length > 0) {
      const duplicate = await users.findOne({
        userid: { $ne: userId },
        $or: duplicateConditions,
      });

      if (duplicate) {
        return res
          .status(400)
          .json({ error: "Username or email already exists" });
      }
    }

    const result = await users.findOneAndUpdate(
      { userid: userId },
      { $set: update },
      { returnDocument: "after", ...publicUserProjection }
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
    const userId = toId(req.params.id);
    const { currPassword, newPassword } = req.body;

    if (!currPassword || !newPassword) {
      return res
        .status(400)
        .json({ error: "Both current and new passwords are required" });
    }

    const users = await collection("users");
    const user = await users.findOne({ userid: userId });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (user.password !== currPassword) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    await users.updateOne({ userid: userId }, { $set: { password: newPassword } });
    res.json({ message: "Password updated successfully" });
  } catch (err) {
    handleError(res, err);
  }
};

const updateUserPassword = async (req, res) => {
  try {
    const { password } = req.body;
    const userId = toId(req.params.id);
    const users = await collection("users");
    const user = await users.findOne({ userid: userId });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (password === user.password) {
      return res
        .status(400)
        .json({ error: "New password cannot be the same as the current one." });
    }

    await users.updateOne({ userid: userId }, { $set: { password } });
    res.json({ message: "Password updated successfully" });
  } catch (err) {
    handleError(res, err);
  }
};

// DELETE user
const deleteUser = async (req, res) => {
  try {
    const users = await collection("users");
    const result = await users.deleteOne({ userid: toId(req.params.id) });

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
      return res
        .status(400)
        .json({ error: "Username and password are required" });
    }

    const users = await collection("users");
    const user = await users.findOne({ username });

    if (!user || user.password !== password) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    res.json({
      message: "Login successful",
      user: {
        userid: user.userid,
        username: user.username,
        name: user.name,
        email: user.email,
        account_type: user.account_type,
      },
    });
  } catch (err) {
    handleError(res, err);
  }
};

// FORGOT PASSWORD - Generate reset token (Development version with test link)
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const genericMessage =
      "If an account with that email exists, a reset link has been sent.";
    const users = await collection("users");
    const user = await users.findOne({ email });

    if (!user) {
      return res.json({ message: genericMessage });
    }

    const resetToken = crypto.randomBytes(2).toString("hex").slice(0, 4);
    const resetTokenExpiry = new Date(Date.now() + 3600000);

    await users.updateOne(
      { userid: user.userid },
      { $set: { reset_token: resetToken, reset_token_expiry: resetTokenExpiry } }
    );

    const isDevelopment = process.env.NODE_ENV !== "production";

    res.json({
      message: genericMessage,
      ...(isDevelopment
        ? { resetLink: `http://localhost:3000/reset-password/${resetToken}` }
        : {}),
    });

    console.log(`Password reset requested for: ${email}`);
    console.log(`Reset token: ${resetToken}`);
  } catch (err) {
    handleError(res, err);
  }
};

// VERIFY RESET TOKEN - Check if token is valid
const verifyResetToken = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: "Reset token is required" });
    }

    const users = await collection("users");
    const user = await users.findOne({
      reset_token: token,
      reset_token_expiry: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    res.json({
      message: "Token is valid",
      user: {
        userid: user.userid,
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
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res
        .status(400)
        .json({ error: "Token and new password are required" });
    }

    if (newPassword.length < 8) {
      return res
        .status(400)
        .json({ error: "Password must be at least 8 characters" });
    }

    const users = await collection("users");
    const user = await users.findOne({
      reset_token: token,
      reset_token_expiry: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    if (user.password === newPassword) {
      return res.status(400).json({
        error: "New password cannot be the same as your current password.",
      });
    }

    await users.updateOne(
      { userid: user.userid },
      {
        $set: { password: newPassword },
        $unset: { reset_token: "", reset_token_expiry: "" },
      }
    );

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    handleError(res, err);
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
        { $unwind: { path: "$returnRecord", preserveNullAndEmptyArrays: true } },
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
