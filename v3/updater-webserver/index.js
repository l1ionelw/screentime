const express = require('express');
const path = require('path');
const app = express();
const port = 3000;
const versionStatus = {
  "latest": "1.0.1",
  "installerName": "1.0.1.exe"
}

// Middleware to log requests
app.use((req, res, next) => {
  console.log(`${req.method} request for '${req.url}'`);
  next();
});

// Root route - serves a JSON variable
app.get('/', (req, res) => {
  return res.json(versionStatus);
});

// /installer/:filename route - serves files from /installers folder
app.get('/installer/:filename', (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, 'installers', filename);

  res.sendFile(filePath, (err) => {
    if (err) {
      console.error(err);
      res.status(err.status || 500).json({ error: 'File not found or cannot be served.' });
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
