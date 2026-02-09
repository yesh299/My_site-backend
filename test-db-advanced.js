const mongoose = require('mongoose');
require('dotenv').config();

console.log('\n');
console.log('MongoDB Cluster Connection Diagnostic Tool');
console.log('\n');

const uri = process.env.MONGODB_URI;
console.log('📋 Connection Details:');
console.log('  URI:', uri);
console.log('  Username: yesh');
console.log('  Cluster: Cluster0 (MongoDB Atlas)\n');

console.log('⏳ Attempting to connect...\n');

mongoose.connect(uri, {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
})
  .then(() => {
    console.log('✅ SUCCESS: MongoDB Connected!\n');
    console.log('✓ Authentication passed');
    console.log('✓ Database connection established');
    console.log('✓ Your backend is ready to start!\n');
    
    mongoose.disconnect();
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ CONNECTION FAILED\n');
    console.error('Error Type:', err.name);
    console.error('Error Message:', err.message, '\n');
    
    if (err.message.includes('authentication failed')) {
      console.log('🔍 DIAGNOSIS: Authentication Error\n');
      console.log('This means either:');
      console.log('  • Username "yesh" is incorrect');
      console.log('  • Password "yesh1234" is incorrect');
      console.log('  • User hasn\'t been created yet\n');
      console.log('ACTION ITEMS:');
      console.log('  1. Go to MongoDB Atlas → Database Access');
      console.log('  2. Verify user "yesh" exists');
      console.log('  3. Reset password to "yesh1234" (no special chars)');
      console.log('  4. Wait 1-2 minutes for changes to sync');
      console.log('  5. Run this test again\n');
    } else if (err.message.includes('ENOTFOUND') || err.message.includes('getaddrinfo')) {
      console.log('🔍 DIAGNOSIS: Network/DNS Error\n');
      console.log('This means:');
      console.log('  • Cannot reach cluster0.8yqlm0d.mongodb.net');
      console.log('  • Check your internet connection\n');
    } else if (err.message.includes('ECONNREFUSED')) {
      console.log('🔍 DIAGNOSIS: Connection Refused\n');
      console.log('This means:');
      console.log('  • MongoDB server is not responding');
      console.log('  • Check if cluster is running in MongoDB Atlas\n');
    }
    
    console.log('📝 Full Error Details:');
    console.log(err);
    process.exit(1);
  });
