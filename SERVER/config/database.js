const mongoose = require("mongoose");

const connectToDatabase = async () => {
  try {
    const uri = process.env.MONGO_URI;

    if (!uri) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }

    await mongoose.connect(uri);

    console.log(`Connected to MongoDB database: ${mongoose.connection.name}`);

    return mongoose.connection;
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    throw err;
  }
};

// Get a MongoDB collection using the active Mongoose connection
const collection = (name) => {
  if (mongoose.connection.readyState !== 1) {
    throw new Error("MongoDB is not connected");
  }

  return mongoose.connection.db.collection(name);
};

// Generate sequential IDs using a counters collection
const getNextSequence = async (sequenceName) => {
  const counters = collection("counters");

  const result = await counters.findOneAndUpdate(
    { _id: sequenceName },
    { $inc: { sequence_value: 1 } },
    {
      upsert: true,
      returnDocument: "after",
    },
  );

  return result.sequence_value;
};

module.exports = {
  connectToDatabase,
  collection,
  getNextSequence,
};
