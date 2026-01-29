const mongoose = require("mongoose");
const colors = require("colors");

const connectDB = async () => {
  try {
    // Use MONGO_URL from .env or default to local MongoDB
    const mongoURL = process.env.MONGO_URL || "mongodb://localhost:27017/chatgpt-clone";
    
    await mongoose.connect(mongoURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(
      `✓ Connected To MongoDB: ${mongoose.connection.host}`.bgGreen.white
    );
  } catch (error) {
    console.log(`✗ MongoDB Connection Error: ${error.message}`.bgRed.white);
    console.log("⚠️  Server will continue running without database...".yellow);
    
    // Don't exit the process - let server run without DB for testing
    // Remove this line if you want server to stop on DB error
    // process.exit(1);
  }
};

module.exports = connectDB;