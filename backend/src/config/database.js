import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/procureai');
    console.log(`✓ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`⚠ MongoDB Connection Failed: ${error.message}`);
    console.log(`⚠ Server will start without database. Some features may be limited.`);
    console.log(`⚠ To fix: Ensure MongoDB is running or install MongoDB Atlas.`);
    // Don't exit - allow server to start without DB
  }
};

export default connectDB;
