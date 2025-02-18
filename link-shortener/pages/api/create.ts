// pages/api/create.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import clientPromise from '../../lib/db';

// Utility function to generate a random slug of 6 alphanumeric characters.
const generateSlug = (length = 6) => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let slug = '';
  for (let i = 0; i < length; i++) {
    slug += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return slug;
};

// API handler to create a new short link.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Only allow POST requests.
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body;

  // Basic URL validation.
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'Invalid URL' });
  }

  try {
    const client = await clientPromise;
    const db = client.db();

    // Generate a unique slug
    let slug;
    let isUnique = false;
    
    while (!isUnique) {
      slug = generateSlug();
      const existing = await db.collection('urls').findOne({ slug });
      if (!existing) {
        isUnique = true;
      }
    }

    // Insert the new URL into the database
    await db.collection('urls').insertOne({
      slug,
      longUrl: url,
      createdAt: new Date(),
      visits: 0
    });

    // Return the generated slug
    return res.status(200).json({ slug });
  } catch (error) {
    console.error('Error creating short URL:', error);
    return res.status(500).json({ error: 'Error creating short URL' });
  }
}
