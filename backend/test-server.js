const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5001;

// CORS
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

app.use(express.json());

// Test routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running!' });
});

app.get('/api/contacts', (req, res) => {
  res.json([]);
});

app.get('/api/requirements', (req, res) => {
  res.json([]);
});

app.get('/api/contacts/followups/all', (req, res) => {
  res.json([]);
});

app.get('/api/contacts/followups/pending', (req, res) => {
  res.json([]);
});

app.listen(PORT, () => {
  console.log(`🚀 Test Server running on port ${PORT}`);
  console.log(`✅ Health: http://localhost:${PORT}/api/health`);
});