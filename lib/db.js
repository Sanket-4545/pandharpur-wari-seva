let dbPromise = null;

export async function getDb(databaseName = "wariseva") {
  if (!dbPromise) {
    const clientPromise = (await import("@/lib/mongodb.js")).default;
    dbPromise = clientPromise.then((client) => client.db(databaseName));
  }
  return dbPromise;
}
