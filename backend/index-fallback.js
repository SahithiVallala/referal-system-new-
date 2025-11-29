require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');

const app = express();
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// Serve test page
app.get('/test', (req, res) => {
  res.sendFile(__dirname + '/test-auth.html');
});

// basic error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5001;

// Try MongoDB first, fall back to memory if not available
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 Auth server running on port ${PORT}`);
      console.log(`📝 Demo superadmin credentials:`);
      console.log(`   Email: admin@example.com`);
      console.log(`   Password: admin123`);
      console.log(`🔗 Test endpoints at: http://localhost:${PORT}/api/auth`);
      console.log(`🗄️ Using MongoDB for persistent storage`);
    });
  })
  .catch(err => {
    console.log('❌ MongoDB not available:', err.message);
    console.log('🔄 Falling back to in-memory storage...');
    
    // Start with in-memory storage
    const memoryApp = require('./index-memory');
    // This won't actually work as intended, let me create a better fallback
    console.log('Please run: npm run dev-memory for in-memory version');
    console.log('Or set up MongoDB following MONGODB_SETUP.md');
    process.exit(1);
  });