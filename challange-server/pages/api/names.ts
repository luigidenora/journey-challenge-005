// pages/api/submit-name.ts
import { VercelRequest, VercelResponse } from '@vercel/node';
import { MongoClient, ServerApiVersion } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI; // Replace with your MongoDB connection string
const MONGODB_DB = 'cluster0'; // Replace with your MongoDB database name
const COLLECTION_NAME = 'names';

const submitNameHandler = async (req: VercelRequest, res: VercelResponse) => {
  if (!MONGODB_URI) {
    return res.status(500).json({ error: 'MongoDB URI not configured' });
  }

  console.log('Received request with method:', req.method);
  // Create a MongoClient with a MongoClientOptions object to set the Stable API version
  const client = new MongoClient(MONGODB_URI, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    },
  });

  if (req.method === 'POST') {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    try {
      // Connect to MongoDB
      await client.connect();

      // Check if the name already exists in the MongoDB collection
      const db = client.db(MONGODB_DB);
      const collection = db.collection(COLLECTION_NAME);
      const existingName = await collection.findOne({ name });

      // If the name doesn't exist, insert it into the MongoDB collection
      if (!existingName) {
        await collection.insertOne({ name });
        return res.json({ message: `Name added: ${name}` });
      } else {
        return res.json({ message: `Name already exists: ${name}` });
      }
    } catch (error) {
      console.error('Error handling name in MongoDB:', (error as any).message);
      return res.status(500).json({ error: 'Failed to handle name in MongoDB' });
    } finally {
      // Close the MongoDB connection
      await client.close();
    }
  } else if (req.method === 'GET') {
    try {
      // Connect to MongoDB
      await client.connect();

      // Retrieve all names from the MongoDB collection
      const db = client.db(MONGODB_DB);
      const collection = db.collection(COLLECTION_NAME);
      const names = await collection.find().toArray();

      // Close the MongoDB connection
      await client.close();

      // Extract only the 'name' field from each document
      const namesArray = names.map((nameDoc) => nameDoc.name);

      return res.json({ names: namesArray });
    } catch (error) {
      console.error('Error retrieving names from MongoDB:', (error as any).message);
      return res.status(500).json({ error: 'Failed to retrieve names from MongoDB' });
    }
  }

  return res.status(405).end(); // Method Not Allowed
};

const allowCors =
  (fn: { (req: any, res: any): void; (arg0: any, arg1: any): any }) =>
  async (req: { method: string }, res: { setHeader: (arg0: string, arg1: string | boolean) => void; status: (arg0: number) => { (): any; new (): any; end: { (): void; new (): any } } }) => {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    // another common pattern
    // res.setHeader('Access-Control-Allow-Origin', (req as any).headers.origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }
    return await fn(req, res);
  };

export default allowCors(submitNameHandler);
