const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const signAccessToken = (user) => {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
}
const signRefreshToken = (user) => {
  return jwt.sign({ id: user._id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
}

// Helper to find user by email
const findUserByEmail = (users, email) => users.find(u => u.email === email);
const findUserById = (users, id) => users.find(u => u._id === id);

exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req); 
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    
    const { name, email, password } = req.body;
    const users = req.app.locals.users;
    
    const exists = findUserByEmail(users, email);
    if (exists) return res.status(400).json({ message: 'Email already used' });
    
    const hashed = await bcrypt.hash(password, 10);
    const newUser = {
      _id: String(Date.now()), // Simple ID generation
      name,
      email,
      password: hashed,
      role: 'user',
      isActive: true,
      createdAt: new Date()
    };
    
    users.push(newUser);
    res.status(201).json({ message: 'User created', userId: newUser._id });
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req); 
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    
    const { email, password } = req.body;
    const users = req.app.locals.users;
    const user = findUserByEmail(users, email);
    
    if (!user || !user.isActive) return res.status(401).json({ message: 'Invalid credentials' });
    
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    // set refresh token in httpOnly cookie
    res.cookie('jid', refreshToken, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production', 
      sameSite: 'strict', 
      maxAge: 7*24*3600*1000 
    });
    
    res.json({ 
      accessToken, 
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role 
      } 
    });
  } catch (err) { next(err); }
};

exports.refreshToken = (req, res, next) => {
  try {
    const token = req.cookies.jid;
    if (!token) return res.status(401).json({ message: 'No refresh token' });
    
    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const users = req.app.locals.users;
    const user = findUserById(users, payload.id);
    
    if (!user) return res.status(401).json({ message: 'User not found' });
    
    const accessToken = signAccessToken(user);
    res.json({ accessToken });
  } catch (err) { 
    return res.status(401).json({ message: 'Invalid refresh token' }); 
  }
};

exports.logout = (req, res) => {
  res.clearCookie('jid'); 
  res.json({ message: 'Logged out' });
};

exports.protect = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Not authenticated' });
  
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = payload; // contains id and role
    next();
  } catch (err) { 
    return res.status(401).json({ message: 'Invalid token' }); 
  }
};

exports.getMe = async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
    
    const users = req.app.locals.users;
    const user = findUserById(users, req.user.id);
    
    if (!user) return res.status(404).json({ message: 'User not found' });
    
    const { password, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  } catch (err) { next(err); }
};