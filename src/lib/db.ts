import { MongoClient, Db } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || 'prisha_enterprise';

let cachedClient: MongoClient | null = null;
let cachedDb: Db | null = null;

export async function connectToDatabase() {
  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
  }

  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb };
  }

  // Set up connection options
  const client = new MongoClient(MONGODB_URI, {
    connectTimeoutMS: 5000, // Short timeout for fallback triggers
    serverSelectionTimeoutMS: 5000
  });

  await client.connect();
  const db = client.db(MONGODB_DB);

  cachedClient = client;
  cachedDb = db;

  return { client, db };
}
