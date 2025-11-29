require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');

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

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// basic error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
mongoose.connect(process.env.MONGO_URI)
  .then(()=> {
    app.listen(PORT, ()=> {
      console.log('\n' + '='.repeat(50));
      console.log('🔐 AUTH BACKEND STARTED');
      console.log('='.repeat(50));
      console.log(`📡 Port: ${PORT}`);
      console.log(`🗄️  Database: MongoDB`);
      console.log(`🌐 CORS: http://localhost:3000`);
      console.log('='.repeat(50) + '\n');
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });