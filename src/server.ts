import dotenv from "dotenv";
dotenv.config();

import app from "./app";
import { connectDB } from "./config/database";

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDB();

    if (!process.env.VERCEL) {
      app.listen(PORT, () => {
        console.log(`🚀 Server running on ${PORT}`);
      });
    }
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

startServer();

export default app;