const User = require('../models/User');
const bcrypt = require('bcrypt');

// Middleware to check if user is admin or superadmin
exports.requireAdmin = (req, res, next) => {
  if (!req.user || (req.user.role !== 'admin' && req.user.role !== 'superadmin')) {
    return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
  next();
};

// Middleware to check if user is superadmin
exports.requireSuperAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'superadmin') {
    return res.status(403).json({ message: 'Access denied. Super admin privileges required.' });
  }
  next();
};

// Get all users (admin and superadmin only)
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.findAll();

    // Remove passwords from response
    const sanitizedUsers = users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    res.json({ users: sanitizedUsers });
  } catch (err) {
    console.error('Error fetching users:', err);
    next(err);
  }
};

// Create new user (superadmin only)
exports.createUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    // Check if email already exists
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Validate role
    const validRoles = ['user', 'admin', 'superadmin'];
    if (role && !validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashed,
      role: role || 'user',
      isActive: true
    });

    console.log(`✅ User created by admin: ${email}`);

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json({ message: 'User created successfully', user: userWithoutPassword });
  } catch (err) {
    console.error('Error creating user:', err);
    next(err);
  }
};

// Update user role (superadmin only)
exports.updateUserRole = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    // Validate role
    const validRoles = ['user', 'admin', 'superadmin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Prevent self-role change
    if (userId === req.user.id) {
      return res.status(400).json({ message: 'You cannot change your own role' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.update(userId, { role });

    console.log(`✅ User role updated: ${user.email} -> ${role}`);
    res.json({ message: 'User role updated successfully' });
  } catch (err) {
    console.error('Error updating user role:', err);
    next(err);
  }
};

// Update user status (admin and superadmin)
exports.updateUserStatus = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ message: 'isActive must be a boolean' });
    }

    // Prevent self-status change
    if (userId === req.user.id) {
      return res.status(400).json({ message: 'You cannot change your own status' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.update(userId, { isActive });

    console.log(`✅ User status updated: ${user.email} -> ${isActive ? 'Active' : 'Inactive'}`);
    res.json({ message: 'User status updated successfully' });
  } catch (err) {
    console.error('Error updating user status:', err);
    next(err);
  }
};

// Delete user (superadmin only)
exports.deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Prevent self-deletion
    if (userId === req.user.id) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await User.delete(userId);

    console.log(`✅ User deleted: ${user.email}`);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    next(err);
  }
};
