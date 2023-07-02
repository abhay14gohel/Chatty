const mongoose = require("mongoose");
const colors = require("colors");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL);
    console.log(
      `backed/config/db: Success: Connected to database: ${conn.connection.host}`
        .bgGreen.bold
    );
  } catch (error) {
    console.log(
      `backend/config/db: Error: Failed to connect to database : ${error.message}`
        .bgRed.bold
    );
    process.exit();
  }
};

module.exports = connectDB;
