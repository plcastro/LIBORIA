require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const { connectToDatabase } = require("../config/database");
const { ensureBorrowerForUser } = require("../services/borrowerLink");

async function main() {
  await connectToDatabase();
  let processed = 0;
  for await (const user of User.find({ account_type: { $in: ["student", "non-librarian"] } }).cursor()) {
    await ensureBorrowerForUser(user);
    processed += 1;
  }
  console.log(`Borrower links checked for ${processed} student accounts.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}).finally(() => mongoose.disconnect());
