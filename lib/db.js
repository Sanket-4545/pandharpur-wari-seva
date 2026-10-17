import getClient from "./mongodb.js";

export async function getDb(databaseName = "wariseva") {
  const client = await getClient();
  return client.db(databaseName);
}
