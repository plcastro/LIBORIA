const { collection, getNextSequence } = require("../config/database");
const mongoose = require("mongoose");

let indexPromise;
const ensureBorrowerIndex = () => {
  if (!indexPromise) {
    indexPromise = collection("borrowers").createIndex(
      { user_id: 1 },
      { unique: true, partialFilterExpression: { user_id: { $gt: "" } } },
    ).catch((error) => {
      console.warn("Borrower user_id index unavailable; borrower links will use transactions:", error.message);
      return false;
    });
  }
  return indexPromise;
};

const linkBorrower = async (user, session) => {
  const borrowers = collection("borrowers");
  const userId = String(user._id);
  const options = { session };

  const borrowerId = await getNextSequence("borrowers", session);
  const existing = await borrowers.findOne({ user_id: userId }, options);
  if (existing) return existing;

  const name = String(user.name || user.username || "").trim();
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const matches = await borrowers.find({ name: { $regex: `^${escaped}$`, $options: "i" } }, options).limit(2).toArray();
  if (matches.length === 1 && !matches[0].user_id) {
    const linked = await borrowers.findOneAndUpdate(
      { _id: matches[0]._id, user_id: { $in: [null, ""] } },
      { $set: { user_id: userId } },
      { ...options, returnDocument: "after" },
    );
    if (linked) return linked.value || linked;
  }

  const borrower = {
    borrower_id: borrowerId,
    user_id: userId,
    name,
    created_at: new Date(),
  };
  await borrowers.insertOne(borrower, options);
  return borrower;
};

const ensureBorrowerForUser = async (user, session) => {
  await ensureBorrowerIndex();
  if (session) return linkBorrower(user, session);
  const ownSession = await mongoose.startSession();
  try {
    let borrower;
    await ownSession.withTransaction(async () => {
      borrower = await linkBorrower(user, ownSession);
    });
    return borrower;
  } catch (error) {
    if (error.code === 11000) {
      const winner = await collection("borrowers").findOne({ user_id: String(user._id) });
      if (winner) return winner;
    }
    throw error;
  } finally {
    await ownSession.endSession();
  }
};

module.exports = { ensureBorrowerForUser, ensureBorrowerIndex };
