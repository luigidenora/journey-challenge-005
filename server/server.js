const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const fileName = 'names.json';

app.use(bodyParser.json());

app.post('/submit-name', (req, res) => {
  const { name } = req.body;

  if (nameExistsInFile(name)) {
    return res.status(400).json({ error: 'Name already exists' });
  }

  appendNameToFile(name);

  res.json({ message: `Name received: ${name}` });
});

function nameExistsInFile(name) {
  const names = readNamesFromFile();
  return names.includes(name);
}

function appendNameToFile(name) {
  const names = readNamesFromFile();
  names.push(name);
  saveNamesToFile(names);
}

function readNamesFromFile() {
  try {
    const data = fs.readFileSync(fileName, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

function saveNamesToFile(names) {
  fs.writeFileSync(fileName, JSON.stringify(names, null, 2), 'utf8');
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
