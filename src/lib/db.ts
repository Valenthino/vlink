import { MongoClient, ServerApiVersion } from 'mongodb';

// Validate MongoDB URI
if (!process.env.MONGODB_URI) {
  console.error('MongoDB URI is not set in environment variables');
  throw new Error('MongoDB URI is required');
}

const uri = process.env.MONGODB_URI;
console.log('Initializing MongoDB connection...');

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  // Add connection timeout and retry settings
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  maxPoolSize: 50,
  retryWrites: true,
  retryReads: true,
});

let clientPromise: Promise<MongoClient>;

async function connectToMongo(): Promise<MongoClient> {
  try {
    const connectedClient = await client.connect();
    console.log('Successfully connected to MongoDB');
    
    // Test the connection by listing databases
    const adminDb = connectedClient.db('admin');
    await adminDb.command({ ping: 1 });
    console.log('MongoDB connection verified');
    
    return connectedClient;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
}

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    console.log('Creating new MongoDB connection in development mode');
    globalWithMongo._mongoClientPromise = connectToMongo();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  // In production mode, it's best to not use a global variable.
  console.log('Creating new MongoDB connection in production mode');
  clientPromise = connectToMongo();
}

// Add connection error handler
client.on('error', (error) => {
  console.error('MongoDB connection error:', error);
});

// Add connection success handler
client.on('connected', () => {
  console.log('MongoDB connection established');
});

// Add connection close handler
client.on('close', () => {
  console.log('MongoDB connection closed');
});

process.on('SIGINT', async () => {
  await client.close();
  console.log('MongoDB connection closed through app termination');
  process.exit(0);
});

export default clientPromise; 