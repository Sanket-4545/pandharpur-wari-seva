import getClient from "./mongodb.js";

let dbPromise = null;

export async function getDb(databaseName = "wariseva") {
  if (!dbPromise) {
    dbPromise = getClient()
      .then((client) => client.db(databaseName))
      .catch((err) => {
        console.error("getDb error:", err);
        dbPromise = null;
        throw err;
      });
  }
  return dbPromise;
}
