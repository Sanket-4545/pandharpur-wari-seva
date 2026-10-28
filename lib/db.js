import getClient from "./mongodb.js";

export async function getDb(databaseName = "wariseva") {
  const client = await getClient();
  return client.db(databaseName);
}

export async function withTransaction(fn, options = {}) {
  const client = await getClient();
  const session = client.startSession();

  try {
    const db = client.db("wariseva");
    const transactionOptions = {
      ...options,
      writeConcern: {
        ...(options.writeConcern || {}),
        w: "majority",
      },
    };

    let result;
    await session.withTransaction(async () => {
      result = await fn(db, session);
    }, transactionOptions);

    return result;
  } finally {
    await session.endSession();
  }
}
