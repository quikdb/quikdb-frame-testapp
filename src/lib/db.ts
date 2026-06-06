import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache || {
  conn: null,
  promise: null,
};

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectDB(): Promise<typeof mongoose | null> {
  if (!MONGODB_URI) {
    console.warn("[DB] No MONGODB_URI set — running with in-memory fallback");
    return null;
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        bufferCommands: false,
      })
      .then((m) => {
        console.log("[DB] Connected to MongoDB");
        return m;
      })
      .catch((err) => {
        console.error("[DB] MongoDB connection error:", err.message);
        cached.promise = null;
        return null as any;
      });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export function isDBConnected(): boolean {
  return mongoose.connection.readyState === 1;
}
