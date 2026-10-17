import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error(
    "Please define the MONGODB_URI environment variable in .env.local"
  );
}

const isDev = process.env.NODE_ENV === "development";

const clientOptions = {
  // Shorter timeout in development (10s) to prevent 30s freezes when network fails, standard 30s in prod
  serverSelectionTimeoutMS: isDev ? 10000 : 30000,
  // Limit pool size in development so HMR / parallel requests do not saturate Atlas cluster limits
  maxPoolSize: isDev ? 20 : 50,
};

let client;
let clientPromise;

function createConnectionPromise() {
  const newClient = new MongoClient(uri, clientOptions);
  const promise = newClient.connect().then(
    (connectedClient) => {
      return connectedClient;
    },
    (err) => {
      // Clear cached promise on failure so subsequent requests can retry
      if (isDev) {
        if (global._mongoClientPromise === promise) {
          global._mongoClientPromise = null;
        }
      } else {
        if (clientPromise === promise) {
          clientPromise = null;
        }
      }
      try {
        newClient.close().catch(() => {});
      } catch {}
      console.error("MongoDB connection error:", err.message);
      throw err;
    }
  );
  return promise;
}

export default function getClient() {
  if (isDev) {
    if (!global._mongoClientPromise) {
      global._mongoClientPromise = createConnectionPromise();
    }
    return global._mongoClientPromise;
  }

  if (!clientPromise) {
    clientPromise = createConnectionPromise();
  }
  return clientPromise;
}
