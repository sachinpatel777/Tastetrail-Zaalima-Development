const mongoose = require('mongoose');

let demoMode = false;

async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    demoMode = true;
    console.warn('MONGO_URI not set. Running in DEMO_MODE with in-memory data.');
    process.env.DEMO_MODE = 'true';
    return;
  }
  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('MongoDB connected');
  } catch (err) {
    demoMode = true;
    process.env.DEMO_MODE = 'true';
    console.warn('Failed to connect to MongoDB, switching to DEMO_MODE. Error:', err.message);
  }
}

module.exports = connectDB;