// server.ts - Complete Vercel Compatible
import app from './app';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// ✅ For Vercel - Just export the app
if (process.env.VERCEL) {
  // Connect to MongoDB if URI exists
  if (process.env.MONGODB_URI) {
    mongoose.connect(process.env.MONGODB_URI)
      .then(() => console.log('✅ MongoDB connected on Vercel'))
      .catch(err => console.error('❌ MongoDB connection error:', err.message));
  }
  
  // Export app for Vercel (CommonJS style)
  module.exports = app;
}

// ✅ For Local Development
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;
  
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce')
    .then(() => {
      console.log('✅ MongoDB connected successfully');
      app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`📍 http://localhost:${PORT}`);
      });
    })
    .catch(err => {
      console.error('❌ MongoDB connection failed:', err.message);
      process.exit(1);
    });
}

export default app;