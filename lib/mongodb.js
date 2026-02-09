import mongoose from "mongoose";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined");
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = {
    conn: null,
    promise: null,
  };
}

async function dbConnect() {
  // ✅ Reuse existing connection
  if (cached.conn) {
    return cached.conn;
  }

  // ✅ Create connection only once
  if (!cached.promise) {
    cached.promise = mongoose.connect(DATABASE_URL, {
      bufferCommands: false,

      // 🔥 CRITICAL for PWA / dev reloads
      maxPoolSize: 10,
      minPoolSize: 1,

      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 20000,

      heartbeatFrequencyMS: 10000,
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    // ❗ Reset promise on failure
    cached.promise = null;
    throw err;
  }

  return cached.conn;
}

export default dbConnect;
