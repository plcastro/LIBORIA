const { MongoClient } = require("mongodb");

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017";
const dbName = process.env.MONGODB_DB || "liboria";

let dbPromise;

const connectToDatabase = async () => {
  if (!dbPromise) {
    dbPromise = MongoClient.connect(uri)
      .then((client) => {
        console.log(`Connected to MongoDB database: ${dbName}`);
        return client.db(dbName);
      })
      .catch((err) => {
        dbPromise = null;
        console.error("MongoDB connection failed:", err);
        throw err;
      });
  }

  return dbPromise;
};

const collection = async (name) => {
  const db = await connectToDatabase();
  return db.collection(name);
};

const getNextSequence = async (name) => {
  const counters = await collection("counters");
  const counter = await counters.findOneAndUpdate(
    { _id: name },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: "after" }
  );

  return counter.seq || counter.value.seq;
};

module.exports = {
  connectToDatabase,
  collection,
  getNextSequence,
};
