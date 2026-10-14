const mongoose = require("mongoose");

const connectToDatabase = async () => {
  try {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      throw new Error("MONGODB_URI is not defined in environment variables");
    }

    await mongoose.connect(uri);

    console.log(`Connected to MongoDB database: ${mongoose.connection.name}`);

    return mongoose.connection;
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    throw err;
  }
};

const collection = (name) => {
  if (mongoose.connection.readyState !== 1) {
    throw new Error("MongoDB is not connected");
  }

  return mongoose.connection.db.collection(name);
};

const getNextSequence = async (sequenceName, session) => {
  const counters = collection("counters");

  const result = await counters.findOneAndUpdate(
    { _id: sequenceName },
    { $inc: { sequence_value: 1 } },
    {
      upsert: true,
      returnDocument: "after",
      ...(session ? { session } : {}),
    },
  );

  const counter = result?.value || result;

  if (!counter?.sequence_value) {
    throw new Error(`Failed to generate sequence for ${sequenceName}`);
  }

  return counter.sequence_value;
};

module.exports = {
  connectToDatabase,
  collection,
  getNextSequence,
};
