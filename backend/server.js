const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const contactsRoute = require('./routes/contacts');
const reqRoute = require('./routes/requirements');

const app = express();

// Configure CORS to allow frontend domain
const corsOptions = {
  origin: [
    'http://localhost:3000', // Local development
    'https://referal-frontend.reddesert-f6724e64.centralus.azurecontainerapps.io', // Deployed frontend
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(bodyParser.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API routes
app.use('/api/contacts', contactsRoute);
app.use('/api/requirements', reqRoute);

const PORT = process.env.PORT || 4000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server listening on ${PORT}`));
