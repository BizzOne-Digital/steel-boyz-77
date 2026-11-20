import mongoose from "mongoose";

type Cache = { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };

const globalForMongo = globalThis as unknown as { __mongoose?: Cache };
const cache: Cache = globalForMongo.__mongoose ?? { conn: null, promise: null };
globalForMongo.__mongoose = cache;

export function isDbConfigured() {
  return Boolean(process.env.MONGODB_URI);
}

/** Reuses one connection across hot reloads and warm serverless invocations. */
export async function connectDB() {
  if (cache.conn) return cache.conn;
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not configured");
  if (!cache.promise) {
    cache.promise = mongoose
      .connect(uri, {
        bufferCommands: false,
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 8000,
      })
      .catch((err) => {
        cache.promise = null;
        throw err;
      });
  }
  cache.conn = await cache.promise;
  return cache.conn;
}

/** Convert lean Mongoose output (ObjectIds, Dates) to plain JSON-safe values. */
export function toPlain<T>(value: unknown): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
