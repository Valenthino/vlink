import { getCollection } from './mongodb'
import { ObjectId } from 'mongodb'

export interface User {
  _id: ObjectId
  email: string
  password: string
  createdAt: Date
}

export async function createUser(email: string, password: string): Promise<User> {
  const collection = await getCollection('users')
  const result = await collection.insertOne({
    email,
    password,
    createdAt: new Date()
  })
  
  return {
    _id: result.insertedId,
    email,
    password,
    createdAt: new Date()
  }
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const collection = await getCollection('users')
  return collection.findOne({ email }) as Promise<User | null>
}

export async function findUserById(id: string): Promise<User | null> {
  const collection = await getCollection('users')
  return collection.findOne({ _id: new ObjectId(id) }) as Promise<User | null>
} 