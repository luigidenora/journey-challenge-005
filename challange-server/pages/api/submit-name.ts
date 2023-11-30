// pages/api/submit-name.ts
import { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';

const GIST_ID = 'your-gist-id'; // Replace with your Gist ID
const GITHUB_TOKEN = 'your-github-token'; // Replace with your GitHub personal access token

const submitNameHandler = async (req: VercelRequest, res: VercelResponse) => {
  if (req.method === 'POST') {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    // Check if the name already exists in the Gist
    if (await nameExistsInGist(name)) {
      return res.status(400).json({ error: 'Name already exists' });
    }

    // Add the name to the Gist
    await addNameToGist(name);

    return res.json({ message: `Name received: ${name}` });
  }

  return res.status(405).end(); // Method Not Allowed
};

// Check if the name already exists in the Gist
async function nameExistsInGist(name: string): Promise<boolean> {
  const gistData = await getGistData();
  return gistData.names.includes(name);
}

// Add a name to the Gist
async function addNameToGist(name: string): Promise<void> {
  const currentData = await getGistData();
  currentData.names.push(name);

  await axios.patch(
    `https://api.github.com/gists/${GIST_ID}`,
    {
      files: {
        'data.json': {
          content: JSON.stringify(currentData),
        },
      },
    },
    {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
      },
    }
  );
}

// Get the content of the Gist
async function getGistData(): Promise<{ names: string[] }> {
  const response = await axios.get(`https://api.github.com/gists/${GIST_ID}`);
  const dataFile = response.data.files['data.json'];
  return dataFile ? JSON.parse(dataFile.content) : { names: [] };
}

export default submitNameHandler;
