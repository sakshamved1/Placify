import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';

dotenv.config();

try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (err) {
  console.warn('DNS server override failed:', err.message);
}

const connectDB = async () => {
  try {
    const connUri = process.env.MONGODB_URI;
    if (!connUri) {
      console.warn('\n[DATABASE WARNING] No MONGODB_URI found in server/.env. Database operations will be unavailable.');
      return;
    }
    console.log(`Connecting to MongoDB...`);
    const conn = await mongoose.connect(connUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`\n[DATABASE ERROR] MongoDB Connection Failed: ${error.message}`);
    console.error(`Please update "MONGODB_URI" in server/.env with your actual MongoDB Atlas connection string and restart the server.\n`);
    // Do not call process.exit(1) - allow Express to run so the client can still reach the server
  }
};

export default connectDB;
