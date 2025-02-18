import { Collection, Db, MongoClient } from 'mongodb'

let client: MongoClient
let db: Db

export async function connectToDatabase(): Promise<void> {
  if (!client) {
    if (!process.env.MONGODB_URI) {
      throw new Error('Please add your MongoDB URI to .env.local')
    }

    client = new MongoClient(process.env.MONGODB_URI)
    await client.connect()
    db = client.db()
  }
}

export async function getCollection(name: string): Promise<Collection> {
  if (!db) {
    await connectToDatabase()
  }
  return db.collection(name)
} 