import mongoose from "mongoose";

// ─── Types ────────────────────────────────────────────────────────────────────

declare global {
  var mongoose: MongooseCache | undefined;
}

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// ─── Validate ENV ─────────────────────────────────────────────────────────────

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Please define MONGODB_URI in .env.local");
}

// ─── Cache ────────────────────────────────────────────────────────────────────

const cached: MongooseCache = global.mongoose ?? { conn: null, promise: null };
global.mongoose = cached;

// ─── Connect ──────────────────────────────────────────────────────────────────

async function dbConnect(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI!, {
      bufferCommands: false,
      maxPoolSize: 20,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default dbConnect;
