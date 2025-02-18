import { ObjectId } from 'mongodb';
import clientPromise from './db';
import { nanoid } from 'nanoid';

// Types for our URL and Analytics records
interface UrlRecord {
  _id?: ObjectId;
  originalUrl: string;
  shortCode: string;
  createdAt: Date;
  clicks: number;
  lastAccessed?: Date;
  isCustom: boolean;
  userId?: string;
  qrCode?: {
    imageUrl: string;
    generatedAt: Date;
    downloadCount: number;
  };
}

interface AnalyticsRecord {
  shortCodeId: ObjectId;
  clickedAt: Date;
  userAgent?: string;
  ipAddress?: string;
  referrer?: string;
}

// Validate URL format
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Generate a random short code
function generateRandomCode(): string {
  // Using nanoid for secure, URL-friendly unique strings
  return nanoid(6);
}

export async function generateShortUrl(originalUrl: string, customCode?: string): Promise<string> {
  // Validate URL format
  if (!isValidUrl(originalUrl)) {
    throw new Error('Invalid URL format');
  }

  const client = await clientPromise;
  const db = client.db('vlink_db');
  const urlsCollection = db.collection<UrlRecord>('urls');

  // Check for existing URL
  const existingUrl = await urlsCollection.findOne({ originalUrl });
  if (existingUrl) {
    return existingUrl.shortCode;
  }

  let shortCode: string;

  // Handle custom code
  if (customCode) {
    const exists = await urlsCollection.findOne({ shortCode: customCode });
    if (exists) {
      throw new Error('Custom code already taken');
    }
    shortCode = customCode;
  } else {
    // Generate unique random code
    let exists = true;
    do {
      shortCode = generateRandomCode();
      exists = await urlsCollection.findOne({ shortCode }) !== null;
    } while (exists);
  }

  // Create new URL record
  const newUrl: UrlRecord = {
    originalUrl,
    shortCode,
    createdAt: new Date(),
    clicks: 0,
    isCustom: !!customCode
  };

  await urlsCollection.insertOne(newUrl);
  return shortCode;
}

export async function getOriginalUrl(shortCode: string, requestData?: {
  userAgent?: string;
  ipAddress?: string;
  referrer?: string;
}): Promise<string> {
  const client = await clientPromise;
  const db = client.db('vlink_db');
  const urlsCollection = db.collection<UrlRecord>('urls');
  const analyticsCollection = db.collection<AnalyticsRecord>('analytics');

  // Find the URL record
  const urlRecord = await urlsCollection.findOne({ shortCode });
  if (!urlRecord) {
    throw new Error('Short URL not found');
  }

  // Update statistics
  await urlsCollection.updateOne(
    { _id: urlRecord._id },
    {
      $inc: { clicks: 1 },
      $set: { lastAccessed: new Date() }
    }
  );

  // Save analytics asynchronously
  if (urlRecord._id) {
    analyticsCollection.insertOne({
      shortCodeId: urlRecord._id,
      clickedAt: new Date(),
      ...requestData
    }).catch(console.error); // Log any errors but don't wait for completion
  }

  return urlRecord.originalUrl;
}

// Additional utility functions

export async function getUrlStats(shortCode: string) {
  const client = await clientPromise;
  const db = client.db('vlink_db');
  const urlsCollection = db.collection<UrlRecord>('urls');

  const urlRecord = await urlsCollection.findOne({ shortCode });
  if (!urlRecord) {
    throw new Error('Short URL not found');
  }

  return {
    clicks: urlRecord.clicks,
    createdAt: urlRecord.createdAt,
    lastAccessed: urlRecord.lastAccessed,
    isCustom: urlRecord.isCustom
  };
}

export async function deleteUrl(shortCode: string) {
  const client = await clientPromise;
  const db = client.db('vlink_db');
  const urlsCollection = db.collection<UrlRecord>('urls');

  const result = await urlsCollection.deleteOne({ shortCode });
  if (result.deletedCount === 0) {
    throw new Error('Short URL not found');
  }
} 