const { default: userEvent } = require("@testing-library/user-event");
const express = require("express");

const app = express();

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "123456",
  database: "liboria_db",
});

app.get("/", (req, res) => {
  res.json("");
});

app.listen(8800, () => {
  console.log("Connected to backend");
});
