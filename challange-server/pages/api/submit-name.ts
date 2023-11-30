// pages/api/submit-name.ts
import { VercelRequest, VercelResponse } from '@vercel/node';
import { MongoClient, ServerApiVersion } from 'mongodb';

const MONGODB_URI = 'mongodb+srv://user:fW1pg1yJRl150HRR@cluster0.g53y4ss.mongodb.net/?retryWrites=true&w=majority'; // Replace with your MongoDB connection string
const MONGODB_DB = 'cluster0'; // Replace with your MongoDB database name
const COLLECTION_NAME = 'names';

const submitNameHandler = async (req: VercelRequest, res: VercelResponse) => {
  console.log('! Received request with method:', req.method);
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

      // Insert the name into the MongoDB collection
      const db = client.db(MONGODB_DB);
      const collection = db.collection(COLLECTION_NAME);
      await collection.insertOne({ name });

      // Close the MongoDB connection
      await client.close();

      return res.json({ message: `Name received: ${name}` });
    } catch (error) {
      console.error('Error inserting name into MongoDB:', (error as any).message);
      return res.status(500).json({ error: 'Failed to insert name into MongoDB' });
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

export default submitNameHandler;
