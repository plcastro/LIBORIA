const db = require("../config/database");

// GET all users
const getUsers = (req, res) => {
  const query = "SELECT userid, username, name, email, account_type FROM users";

  db.query(query, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.json(results);
  });
};

// GET user by ID
const getUserById = (req, res) => {
  const userId = req.params.id;
  const query =
    "SELECT userid, username, name, email, account_type FROM users WHERE userid = ?";

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(results[0]);
  });
};

// CREATE user (for admin)
const createUser = (req, res) => {
  const { username, password, name, email, account_type } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required" });
  }

  const query =
    "INSERT INTO users (username, password, name, email, account_type) VALUES (?, ?, ?, ?, ?)";

  db.query(
    query,
    [
      username,
      password,
      name || null,
      email || null,
      account_type || "librarian",
    ],
    (err, results) => {
      if (err) {
        console.error(err);
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(400).json({ error: "Username already exists" });
        }
        return res.status(500).json({ error: "Internal Server Error" });
      }

      // Return user without password
      const getQuery =
        "SELECT userid, username, name, email, account_type FROM users WHERE userid = ?";
      db.query(getQuery, [results.insertId], (err, userResults) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Internal Server Error" });
        }
        res.status(201).json(userResults[0]);
      });
    }
  );
};

// REGISTER user (for public signup)
const register = (req, res) => {
  const { name, email, username, password } = req.body;

  console.log("Registration attempt:", { name, email, username });

  // Validation
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

  // Check if username already exists
  const checkUsernameQuery = "SELECT userid FROM users WHERE username = ?";
  db.query(checkUsernameQuery, [username], (err, usernameResults) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (usernameResults.length > 0) {
      return res.status(400).json({ error: "Username already exists" });
    }

    // Check if email already exists
    const checkEmailQuery = "SELECT userid FROM users WHERE email = ?";
    db.query(checkEmailQuery, [email], (err, emailResults) => {
      if (err) {
        console.error(err);
        // If error is because email column doesn't exist, continue with registration
        if (err.code === "ER_BAD_FIELD_ERROR") {
          console.log(
            "Email column does not exist, continuing without email check"
          );
          proceedWithRegistration();
        } else {
          return res.status(500).json({ error: "Internal Server Error" });
        }
      } else {
        if (emailResults.length > 0) {
          return res.status(400).json({ error: "Email already exists" });
        }
        proceedWithRegistration();
      }
    });

    function proceedWithRegistration() {
      // Insert user with all fields - new registrations are always 'librarian' by default
      const insertQuery =
        "INSERT INTO users (name, email, username, password, account_type) VALUES (?, ?, ?, ?, ?)";

      db.query(
        insertQuery,
        [name, email, username, password, "librarian"],
        (err, results) => {
          if (err) {
            console.error("Insert error:", err);

            // Handle specific MySQL errors
            if (err.code === "ER_BAD_FIELD_ERROR") {
              // If columns don't exist, fall back to basic registration
              console.log("Some columns not found, using basic registration");
              const basicQuery =
                "INSERT INTO users (username, password, account_type) VALUES (?, ?, ?)";

              db.query(
                basicQuery,
                [username, password, "librarian"],
                (err, basicResults) => {
                  if (err) {
                    console.error("Basic insert error:", err);
                    if (err.code === "ER_DUP_ENTRY") {
                      return res
                        .status(400)
                        .json({ error: "Username already exists" });
                    }
                    return res
                      .status(500)
                      .json({ error: "Internal Server Error" });
                  }

                  // Return basic user info
                  const getQuery =
                    "SELECT userid, username, account_type FROM users WHERE userid = ?";
                  db.query(
                    getQuery,
                    [basicResults.insertId],
                    (err, userResults) => {
                      if (err) {
                        console.error(err);
                        return res
                          .status(500)
                          .json({ error: "Internal Server Error" });
                      }
                      res.status(201).json({
                        message:
                          "Registration successful (basic account created)",
                        user: userResults[0],
                        note: "Name and email were not saved (columns not available)",
                      });
                    }
                  );
                }
              );
            } else if (err.code === "ER_DUP_ENTRY") {
              return res
                .status(400)
                .json({ error: "Username or email already exists" });
            } else {
              return res.status(500).json({ error: "Internal Server Error" });
            }
          } else {
            // Success - return full user info
            const getQuery =
              "SELECT userid, username, name, email, account_type FROM users WHERE userid = ?";
            db.query(getQuery, [results.insertId], (err, userResults) => {
              if (err) {
                console.error(err);
                return res.status(500).json({ error: "Internal Server Error" });
              }
              res.status(201).json({
                message: "Registration successful",
                user: userResults[0],
              });
            });
          }
        }
      );
    }
  });
};

// UPDATE user (including account_type)
const updateUser = (req, res) => {
  const userId = req.params.id;
  const { username, password, name, email, account_type } = req.body;

  // Build dynamic query based on provided fields
  let query = "UPDATE users SET ";
  const values = [];
  const updates = [];

  if (username) {
    updates.push("username = ?");
    values.push(username);
  }
  if (password) {
    updates.push("password = ?");
    values.push(password);
  }
  if (name !== undefined) {
    updates.push("name = ?");
    values.push(name);
  }
  if (email !== undefined) {
    updates.push("email = ?");
    values.push(email);
  }
  if (account_type) {
    updates.push("account_type = ?");
    values.push(account_type);
  }

  if (updates.length === 0) {
    return res.status(400).json({ error: "No fields to update" });
  }

  query += updates.join(", ") + " WHERE userid = ?";
  values.push(userId);

  db.query(query, values, (err, results) => {
    if (err) {
      console.error(err);
      if (err.code === "ER_DUP_ENTRY") {
        return res
          .status(400)
          .json({ error: "Username or email already exists" });
      }
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get updated user
    const getQuery =
      "SELECT userid, username, name, email, account_type FROM users WHERE userid = ?";
    db.query(getQuery, [userId], (err, userResults) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Internal Server Error" });
      }
      res.json(userResults[0]);
    });
  });
};

// DELETE user
const deleteUser = (req, res) => {
  const userId = req.params.id;
  const query = "DELETE FROM users WHERE userid = ?";

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (results.affectedRows === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  });
};

// LOGIN user
const login = (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ error: "Username and password are required" });
  }

  const query =
    "SELECT userid, username, password, name, email, account_type FROM users WHERE username = ?";

  db.query(query, [username], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: "Internal Server Error" });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const user = results[0];

    // Check if password matches (plain text comparison)
    if (user.password !== password) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    // Login successful - return user info without password
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
  });
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  register,
  updateUser,
  deleteUser,
  login,
};
