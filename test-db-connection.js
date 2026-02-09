const mongoose = require('mongoose');
require('dotenv').config();

console.log('Testing MongoDB Connection...');
console.log('URI:', process.env.MONGODB_URI);

mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
})
  .then(() => {
    console.log('✅ MongoDB Connected Successfully!');
    console.log('Connection String is Valid');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ MongoDB Connection Failed');
    console.error('Error:', err.message);
    console.error('\nTroubleshooting Steps:');
    console.error('1. Verify username: yesh');
    console.error('2. Verify password contains: @123');
    console.error('3. Go to MongoDB Atlas → Cluster0 → Network Access');
    console.error('4. Ensure IP address 0.0.0.0/0 is whitelisted');
    console.error('5. Try resetting the password for user "yesh"');
    process.exit(1);
  });
