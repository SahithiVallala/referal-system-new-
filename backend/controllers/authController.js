const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { hybridAuth, validateAzureToken } = require('../middleware/azureAuthMiddleware');

const signAccessToken = (user) => {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
}
const signRefreshToken = (user) => {
  return jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
}

exports.register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(e => e.msg).join(', ');
      return res.status(400).json({ message: `Validation failed: ${errorMessages}` });
    }
    const { name, email, password } = req.body;

    // Check if email already exists
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(400).json({ message: 'Email already registered. Please use a different email or login.' });
    }

    // Create new user
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashed,
      role: 'user', // Default role
      isActive: true // Active by default
    });

    console.log(`✅ New user registered: ${email}`);
    res.status(201).json({ message: 'Account created successfully! You can now login.', userId: user.id });
  } catch (err) {
    console.error('Registration error:', err);
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const errors = validationResult(req); if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    // Check if account is deactivated
    if (!user.isActive) {
      return res.status(403).json({
        message: 'Your account has been blocked by an administrator. Please contact support for assistance.',
        blocked: true
      });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    // set refresh token in httpOnly cookie
    res.cookie('jid', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 7*24*3600*1000 });
    res.json({ accessToken, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  } catch (err) { next(err); }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies.jid;
    if (!token) return res.status(401).json({ message: 'No refresh token' });
    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    // Fetch user to get current role (in case it changed)
    const user = await User.findById(payload.id);
    if (!user) return res.status(401).json({ message: 'User not found' });

    // Check if user is still active
    if (!user.isActive) {
      return res.status(403).json({ message: 'Account deactivated' });
    }

    const accessToken = signAccessToken(user);
    res.json({ accessToken });
  } catch (err) { return res.status(401).json({ message: 'Invalid refresh token' }); }
};

exports.logout = (req, res) => {
  res.clearCookie('jid'); res.json({ message: 'Logged out' });
};

/**
 * Protect middleware - supports both local JWT and Azure AD tokens
 * This middleware validates the Authorization header and attaches user info to req.user
 */
exports.protect = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Not authenticated' });

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  // Decode token to check its type
  const decoded = jwt.decode(token, { complete: true });

  if (!decoded) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  const payload = decoded.payload;

  // Check if it's an Azure AD token
  const isAzureToken = payload.iss && (
    payload.iss.includes('login.microsoftonline.com') ||
    payload.iss.includes('sts.windows.net')
  );

  if (isAzureToken) {
    // For Azure AD tokens, use the validateAzureToken middleware
    return validateAzureToken(req, res, next);
  } else {
    // Local JWT validation
    try {
      const localPayload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      req.user = localPayload; // contains id and role
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  }
};

exports.getMe = async (req, res, next) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });

    // For Azure AD users, return the info from the token
    // Azure AD tokens have different ID format (GUID)
    const isAzureUser = req.user.tenantId !== undefined;

    if (isAzureUser) {
      // Return Azure AD user info directly from token
      return res.json({
        user: {
          id: req.user.id,
          name: req.user.name,
          email: req.user.email,
          role: req.user.role || 'user',
          tenantId: req.user.tenantId,
          provider: 'azure-ad'
        }
      });
    }

    // For local users, fetch from database
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    res.json({ user: { ...userWithoutPassword, provider: 'local' } });
  } catch (err) { next(err); }
};

/**
 * Endpoint for Azure AD login
 * This endpoint is called after successful Azure AD authentication on the frontend
 * It can be used to sync Azure AD users with local database if needed
 */
exports.azureLogin = async (req, res, next) => {
  try {
    // User info is attached by the validateAzureToken middleware
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Return user info from the Azure AD token
    res.json({
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role || 'user',
        tenantId: req.user.tenantId,
        provider: 'azure-ad'
      }
    });
  } catch (err) {
    next(err);
  }
};
