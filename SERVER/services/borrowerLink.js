const { collection, getNextSequence } = require("../config/database");

let indexPromise;
const ensureBorrowerIndex = () => {
  if (!indexPromise) {
    indexPromise = collection("borrowers").createIndex(
      { user_id: 1 },
      { unique: true, partialFilterExpression: { user_id: { $type: "string" } } },
    ).catch((error) => { indexPromise = null; throw error; });
  }
  return indexPromise;
};

const ensureBorrowerForUser = async (user, session) => {
  await ensureBorrowerIndex();
  const borrowers = collection("borrowers");
  const userId = String(user._id);
  const options = session ? { session } : {};
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
    borrower_id: await getNextSequence("borrowers", session),
    user_id: userId,
    name,
    year_level: "",
    course: "",
    created_at: new Date(),
  };
  try {
    await borrowers.insertOne(borrower, options);
    return borrower;
  } catch (error) {
    if (error.code === 11000) {
      const winner = await borrowers.findOne({ user_id: userId }, options);
      if (winner) return winner;
    }
    throw error;
  }
};

module.exports = { ensureBorrowerForUser, ensureBorrowerIndex };
