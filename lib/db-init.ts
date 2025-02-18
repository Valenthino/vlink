import clientPromise from './db';

async function initializeDatabase() {
  try {
    const client = await clientPromise;
    const db = client.db('vlink_db');

    // Create URLs collection with schema validation
    await db.createCollection('urls', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['originalUrl', 'shortCode', 'createdAt', 'clicks'],
          properties: {
            originalUrl: {
              bsonType: 'string',
              description: 'must be a string and is required'
            },
            shortCode: {
              bsonType: 'string',
              description: 'must be a string and is required'
            },
            createdAt: {
              bsonType: 'date',
              description: 'must be a date and is required'
            },
            clicks: {
              bsonType: 'int',
              minimum: 0,
              description: 'must be a non-negative integer and is required'
            },
            lastAccessed: {
              bsonType: 'date',
              description: 'must be a date if present'
            },
            isCustom: {
              bsonType: 'bool',
              description: 'must be a boolean if present'
            },
            userId: {
              bsonType: 'string',
              description: 'must be a string if present'
            },
            qrCode: {
              bsonType: 'object',
              properties: {
                imageUrl: {
                  bsonType: 'string',
                  description: 'must be a string if present'
                },
                generatedAt: {
                  bsonType: 'date',
                  description: 'must be a date if present'
                },
                downloadCount: {
                  bsonType: 'int',
                  minimum: 0,
                  description: 'must be a non-negative integer if present'
                }
              }
            }
          }
        }
      }
    });

    // Create Analytics collection with schema validation
    await db.createCollection('analytics', {
      validator: {
        $jsonSchema: {
          bsonType: 'object',
          required: ['shortCodeId', 'clickedAt'],
          properties: {
            shortCodeId: {
              bsonType: 'objectId',
              description: 'must be an ObjectId and is required'
            },
            clickedAt: {
              bsonType: 'date',
              description: 'must be a date and is required'
            },
            userAgent: {
              bsonType: 'string',
              description: 'must be a string if present'
            },
            ipAddress: {
              bsonType: 'string',
              description: 'must be a string if present'
            },
            referrer: {
              bsonType: 'string',
              description: 'must be a string if present'
            }
          }
        }
      }
    });

    // Create indexes
    await db.collection('urls').createIndex({ shortCode: 1 }, { unique: true });
    await db.collection('urls').createIndex({ userId: 1 });
    await db.collection('urls').createIndex({ createdAt: 1 });
    
    await db.collection('analytics').createIndex({ shortCodeId: 1 });
    await db.collection('analytics').createIndex({ clickedAt: 1 });

    console.log('Database initialized successfully!');
    
    // Insert a test URL to verify everything works
    const testUrl = await db.collection('urls').insertOne({
      originalUrl: 'https://example.com',
      shortCode: 'test123',
      createdAt: new Date(),
      clicks: 0,
      isCustom: false
    });

    console.log('Test URL inserted:', testUrl);

  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

// Run the initialization
initializeDatabase()
  .then(() => console.log('Setup complete'))
  .catch(console.error)
  .finally(() => process.exit()); 