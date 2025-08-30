import { MongoClient } from 'mongodb';

let client;
let db;
let envLoaded = false;
async function loadEnvIfNeeded() {
  if (envLoaded) return;
  if (process.env.NODE_ENV === "development") {
    try {
      const dotenv = await import('dotenv');
      dotenv.config();
      console.log("dotenv loaded for development");
    } catch (error) {
      console.log("dotenv not available, using system environment variables");
    }
  }
  envLoaded = true;
}
function getEnvVars() {
  const MONGODB_URI = process.env.MONGODB_URI;
  const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || "DevRequest";
  console.log("Available env vars:", {
    MONGODB_URI: MONGODB_URI ? "SET" : "NOT SET",
    MONGODB_DB_NAME: "SET" ,
    NODE_ENV: process.env.NODE_ENV
  });
  if (!MONGODB_URI) {
    console.error("MONGODB_URI is not defined. Available env vars:", Object.keys(process.env).filter((key) => key.includes("MONGO")));
    throw new Error("Please define the MONGODB_URI environment variable");
  }
  return { MONGODB_URI, MONGODB_DB_NAME };
}
async function connectToDatabase() {
  if (client && db) {
    return { db, client };
  }
  await loadEnvIfNeeded();
  const { MONGODB_URI, MONGODB_DB_NAME } = getEnvVars();
  try {
    client = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 1e4,
      // 10 seconds timeout
      connectTimeoutMS: 1e4,
      // 10 seconds timeout
      socketTimeoutMS: 1e4
      // 10 seconds timeout
    });
    const connectPromise = client.connect();
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("MongoDB connection timeout")), 1e4);
    });
    await Promise.race([connectPromise, timeoutPromise]);
    db = client.db(MONGODB_DB_NAME);
    console.log("Connected to MongoDB successfully");
    return { db, client };
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw error;
  }
}
async function getRequestsCollection() {
  const { db: db2 } = await connectToDatabase();
  return db2.collection("requests");
}

export { connectToDatabase as c, getRequestsCollection as g };
