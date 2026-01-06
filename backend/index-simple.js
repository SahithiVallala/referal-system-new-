require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { exec } = require('child_process');

// Auto-resolve port conflicts
function killPortProcess(port) {
  return new Promise((resolve) => {
    const command = process.platform === 'win32' 
      ? `for /f "tokens=5" %a in ('netstat -ano ^| findstr :${port}') do taskkill /f /pid %a`
      : `lsof -ti:${port} | xargs kill -9`;
    
    exec(command, (error) => {
      if (error) {
        console.log(`ℹ️  No existing process found on port ${port}`);
      } else {
        console.log(`✅ Cleared port ${port}`);
      }
      resolve();
    });
  });
}

// Try to load routes safely
const app = express();

// CORS configuration
app.use(cors({
  origin: 'http://localhost:3000', // Allow requests from React frontend
  credentials: true, // Allow cookies to be sent
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(cookieParser());

// Load routes with error handling
try {
  const contactRoutes = require('./routes/contacts');
  app.use('/api/contacts', contactRoutes);
  console.log('✅ Contacts routes loaded');
} catch (err) {
  console.error('❌ Failed to load contacts routes:', err.message);
}

try {
  const requirementRoutes = require('./routes/requirements');
  app.use('/api/requirements', requirementRoutes);
  console.log('✅ Requirements routes loaded');
} catch (err) {
  console.error('❌ Failed to load requirements routes:', err.message);
}

// Basic health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Contact Management Backend is running' });
});

// Basic error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

// Auto-start server with port conflict resolution
async function startServer() {
  const PORT = process.env.PORT || 5001;
  
  try {
    // Kill any existing processes on the target port
    await killPortProcess(PORT);
    
    // Small delay to ensure port is fully released
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Start the server
    app.listen(PORT, () => {
      console.log('\n' + '='.repeat(50));
      console.log('🔐 CONTACT MANAGEMENT BACKEND STARTED');
      console.log('='.repeat(50));
      console.log(`📡 Port: ${PORT}`);
      console.log(`🗄️  Database: SQLite`);
      console.log(`🌐 CORS: http://localhost:3000`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/api/health`);
      console.log('='.repeat(50) + '\n');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

// Start the server immediately
console.log('🚀 Initializing Contact Management Backend...');
startServer();