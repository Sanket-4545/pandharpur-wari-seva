let dbPromise = null;

export async function getDb(databaseName = "wariseva") {
  if (!dbPromise) {
    const getClient = (await import("@/lib/mongodb.js")).default;
    dbPromise = getClient()
      .then((client) => client.db(databaseName))
      .catch((err) => {
        dbPromise = null;
        throw err;
      });
  }
  return dbPromise;
}
