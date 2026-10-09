const mongoose = require("mongoose");

const connectToDatabase = async () => {
  try {
    const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/liboria";

    await mongoose.connect(uri);

    console.log(`Connected to MongoDB database: ${mongoose.connection.name}`);

    return mongoose.connection;
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    throw err;
  }
};

module.exports = {
  connectToDatabase,
};
