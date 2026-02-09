require('dotenv').config();
const mongoose = require('mongoose');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const connectDB = async (maxAttempts = 5, delayMs = 2000) => {
  let attempt = 0;
  while (attempt < maxAttempts) {
    attempt += 1;
    try {
      await mongoose.connect(process.env.MONGODB_URL);
      console.log('✅ Connected to MongoDB Database');
      return;
    } catch (err) {
      console.error(`MongoDB connect failed (attempt ${attempt}/${maxAttempts})`, err.message);
      if (attempt >= maxAttempts) {
        console.error('Giving up after max attempts. Server will continue without DB.');
        return; // Do not throw; keep server running
      }
      await sleep(delayMs);
    }
  }
};

// Disconnect on app termination
process.on('SIGINT', async () => {
  await mongoose.disconnect();
  process.exit(0);
});

module.exports = { connectDB };
