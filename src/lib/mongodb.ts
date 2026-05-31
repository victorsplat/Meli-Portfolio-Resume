import { MongoClient } from 'mongodb';

let cachedPromise: Promise<MongoClient> | null = null;

export default function getClient(): Promise<MongoClient> {
  if (!cachedPromise) {
    const uri = process.env.MONGODB_URI!;
    const client = new MongoClient(uri);

    if (process.env.NODE_ENV === 'development') {
      if (!(globalThis as any)._mongoClientPromise) {
        (globalThis as any)._mongoClientPromise = client.connect();
      }
      cachedPromise = (globalThis as any)._mongoClientPromise;
    } else {
      cachedPromise = client.connect();
    }
  }
  return cachedPromise!;
}
