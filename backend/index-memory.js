require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');

// For demo purposes, we'll use a simple in-memory store
// In production, replace this with MongoDB
let users = [
  {
    _id: '1',
    name: 'Super Admin',
    email: 'admin@example.com',
    password: '$2b$10$rQ9qE.rN/EHH/bOJKjM2jO8HJ5X8xrJG.XnG9t9vY8aAz1RkI5B4i', // admin123
    role: 'superadmin',
    isActive: true,
    createdAt: new Date()
  }
];

const authRoutes = require('./routes/auth-memory');
const adminRoutes = require('./routes/admin-memory');

const app = express();
app.use(express.json());
app.use(cookieParser());

// Serve test page
app.get('/test', (req, res) => {
  res.sendFile(__dirname + '/test-auth.html');
});

// Make users available to routes
app.locals.users = users;

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// basic error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Auth server running on port ${PORT}`);
  console.log(`📝 Demo superadmin credentials:`);
  console.log(`   Email: admin@example.com`);
  console.log(`   Password: admin123`);
  console.log(`🔗 Test endpoints at: http://localhost:${PORT}/api/auth`);
});