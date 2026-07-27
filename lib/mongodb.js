import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error(
    "Please define the MONGODB_URI environment variable in .env.local"
  );
}

let client;
let clientPromise;

function connect() {
  if (clientPromise) return clientPromise;

  client = new MongoClient(uri);
  clientPromise = client.connect().catch((err) => {
    console.error("MongoDB connection error:", err.message);
    clientPromise = null;
    client = null;
    throw err;
  });

  return clientPromise;
}

export default function getClient() {
  if (process.env.NODE_ENV === "development") {
    if (!global._mongoClientPromise || !clientPromise) {
      global._mongoClientPromise = connect();
    }
    return global._mongoClientPromise;
  }
  return connect();
}
