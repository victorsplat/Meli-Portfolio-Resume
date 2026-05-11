import { MongoClient } from 'mongodb';

let cachedPromise = null;

export default function getClient() {
  if (!cachedPromise) {
    const uri = process.env.MONGODB_URI;
    const client = new MongoClient(uri);

    if (process.env.NODE_ENV === 'development') {
      if (!global._mongoClientPromise) {
        global._mongoClientPromise = client.connect();
      }
      cachedPromise = global._mongoClientPromise;
    } else {
      cachedPromise = client.connect();
    }
  }
  return cachedPromise;
}
