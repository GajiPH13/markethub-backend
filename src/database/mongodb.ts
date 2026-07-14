import { Db, MongoClient, ServerApiVersion } from "mongodb";

const mongoUri = process.env.MONGODB_URI;
const databaseName = process.env.MONGODB_DB_NAME;

if (!mongoUri) {
  throw new Error("MONGODB_URI is missing.");
}

if (!databaseName) {
  throw new Error("MONGODB_DB_NAME is missing.");
}

export const mongoClient = new MongoClient(mongoUri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: false,
    deprecationErrors: true,
  },
  maxPoolSize: 20,
  minPoolSize: 0,
  serverSelectionTimeoutMS: 10_000,
  connectTimeoutMS: 10_000,
});

export const mongoDatabase: Db = mongoClient.db(databaseName);

let isConnected = false;
let connectionPromise: Promise<Db> | null = null;

export async function connectToDatabase(): Promise<Db> {
  if (isConnected) {
    return mongoDatabase;
  }

  if (!connectionPromise) {
    connectionPromise = mongoClient
      .connect()
      .then(async () => {
        await mongoDatabase.command({ ping: 1 });

        isConnected = true;

        console.log(`MongoDB connected: ${databaseName}`);

        return mongoDatabase;
      })
      .catch((error: unknown) => {
        connectionPromise = null;
        throw error;
      });
  }

  return connectionPromise;
}

export function getDatabase(): Db {
  if (!isConnected) {
    throw new Error(
      "MongoDB is not connected. Call connectToDatabase() before using the database.",
    );
  }

  return mongoDatabase;
}

export function getMongoClient(): MongoClient {
  return mongoClient;
}

export async function closeDatabaseConnection(): Promise<void> {
  await mongoClient.close();

  isConnected = false;
  connectionPromise = null;

  console.log("MongoDB connection closed.");
}