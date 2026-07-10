import app from "./app";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI!;

// MongoDB Connection
const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) return;

    await mongoose.connect(MONGODB_URI);
    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
  }
};

// ==========================
// Vercel
// ==========================
if (process.env.VERCEL) {
  connectDB();
}

// ==========================
// Local Development
// ==========================
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5000;

  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  });
}

export default app;