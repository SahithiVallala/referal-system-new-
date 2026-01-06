const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/authController');
const User = require('../models/User');
const { role } = require('../middleware/roleMiddleware');
const bcrypt = require('bcrypt');
const { logAudit, getAuditLogs, getAnalytics } = require('../utils/activityLogger');

// All admin routes require authentication
router.use(authCtrl.protect);

// GET /admin/users - Get all users (admin and superadmin)
router.get('/users', role(['admin','superadmin']), async (req, res, next) => {
  try {
    const users = await User.findAll();
    // Remove passwords from response
    const sanitizedUsers = users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return { ...userWithoutPassword, _id: user.id }; // Add _id for frontend compatibility
    });
    res.json({ users: sanitizedUsers });
  } catch (err) {
    console.error('Error fetching users:', err);
    next(err);
  }
});

// POST /admin/create-user - Create new user (superadmin only)
router.post('/create-user', role('superadmin'), async (req, res, next) => {
  try {
    const { name, email, password, role: newRole } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    // Check if email already exists
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashed,
      role: newRole || 'user',
      isActive: true
    });

    console.log(`✅ User created by admin: ${email}`);

    // Log audit action
    await logAudit({
      adminId: req.user.id,
      adminName: req.user.name || 'Unknown',
      adminEmail: req.user.email || 'Unknown',
      adminRole: req.user.role,
      actionType: 'CREATE_USER',
      actionDescription: `Created new user: ${email} with role: ${newRole || 'user'}`,
      targetUserId: user.id,
      targetUserName: name,
      targetUserEmail: email,
      newValue: newRole || 'user'
    });

    res.status(201).json({
      message: 'User created successfully',
      user: { id: user.id, _id: user.id, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error('Error creating user:', err);
    next(err);
  }
});

// PATCH /admin/users/:userId/role - Update user role (superadmin only)
router.patch('/users/:userId/role', role('superadmin'), async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { role: newRole } = req.body;

    // Validate role
    const validRoles = ['user', 'admin', 'superadmin'];
    if (!validRoles.includes(newRole)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    // Prevent self-role change
    if (userId === String(req.user.id)) {
      return res.status(400).json({ message: 'You cannot change your own role' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent demoting other superadmins
    if (user.role === 'superadmin' && newRole !== 'superadmin') {
      return res.status(403).json({ message: 'Cannot demote other superadmin accounts' });
    }

    await User.update(userId, { role: newRole });
    console.log(`✅ User role updated: ${user.email} -> ${newRole}`);

    // Log audit action
    await logAudit({
      adminId: req.user.id,
      adminName: req.user.name || 'Unknown',
      adminEmail: req.user.email || 'Unknown',
      adminRole: req.user.role,
      actionType: 'CHANGE_ROLE',
      actionDescription: `Changed user role from ${user.role} to ${newRole}`,
      targetUserId: parseInt(userId),
      targetUserName: user.name,
      targetUserEmail: user.email,
      oldValue: user.role,
      newValue: newRole
    });

    res.json({ message: 'User role updated successfully' });
  } catch (err) {
    console.error('Error updating user role:', err);
    next(err);
  }
});

// PATCH /admin/users/:userId/status - Update user status (admin and superadmin)
router.patch('/users/:userId/status', role(['admin','superadmin']), async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ message: 'isActive must be a boolean' });
    }

    // Prevent self-status change
    if (userId === String(req.user.id)) {
      return res.status(400).json({ message: 'You cannot change your own status' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent admins from modifying superadmins
    if (req.user.role === 'admin' && user.role === 'superadmin') {
      return res.status(403).json({ message: 'Admins cannot modify superadmin accounts' });
    }

    await User.update(userId, { isActive });
    console.log(`✅ User status updated: ${user.email} -> ${isActive ? 'Active' : 'Inactive'}`);

    // Log audit action
    await logAudit({
      adminId: req.user.id,
      adminName: req.user.name || 'Unknown',
      adminEmail: req.user.email || 'Unknown',
      adminRole: req.user.role,
      actionType: 'CHANGE_STATUS',
      actionDescription: `Changed user status to ${isActive ? 'Active' : 'Inactive'}`,
      targetUserId: parseInt(userId),
      targetUserName: user.name,
      targetUserEmail: user.email,
      oldValue: user.isActive ? 'Active' : 'Inactive',
      newValue: isActive ? 'Active' : 'Inactive'
    });

    res.json({ message: 'User status updated successfully' });
  } catch (err) {
    console.error('Error updating user status:', err);
    next(err);
  }
});

// DELETE /admin/users/:userId - Delete user (superadmin only)
router.delete('/users/:userId', role('superadmin'), async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Prevent self-deletion
    if (userId === String(req.user.id)) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deleting other superadmins
    if (user.role === 'superadmin') {
      return res.status(403).json({ message: 'Cannot delete other superadmin accounts' });
    }

    await User.delete(userId);
    console.log(`✅ User deleted: ${user.email}`);

    // Log audit action
    await logAudit({
      adminId: req.user.id,
      adminName: req.user.name || 'Unknown',
      adminEmail: req.user.email || 'Unknown',
      adminRole: req.user.role,
      actionType: 'DELETE_USER',
      actionDescription: `Deleted user: ${user.email}`,
      targetUserId: parseInt(userId),
      targetUserName: user.name,
      targetUserEmail: user.email,
      metadata: { deletedRole: user.role }
    });

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    next(err);
  }
});

// GET /admin/analytics - Get user activity analytics (admin and superadmin)
router.get('/analytics', role(['admin', 'superadmin']), async (req, res, next) => {
  try {
    const { userId, period, startDate, endDate } = req.query;

    const analytics = await getAnalytics({
      userId: userId ? parseInt(userId) : null,
      period: period || 'daily',
      startDate,
      endDate
    });

    res.json(analytics);
  } catch (err) {
    console.error('Error fetching analytics:', err);
    next(err);
  }
});

// GET /admin/users/:userId/analytics - Get detailed analytics for a specific user
router.get('/users/:userId/analytics', role(['admin', 'superadmin']), async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { period = 'daily', days = 30 } = req.query;

    const db = require('../db');

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // Get user info
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get activity summary by action type
    const activitySummary = await db.all(
      `SELECT
        action_type,
        COUNT(*) as count,
        MAX(created_at) as last_activity
      FROM user_activities
      WHERE user_id = ? AND created_at >= ? AND created_at <= ?
      GROUP BY action_type
      ORDER BY count DESC`,
      [parseInt(userId), startDate.toISOString(), endDate.toISOString()]
    );

    // Get daily activity breakdown
    const dailyActivity = await db.all(
      `SELECT
        DATE(created_at) as date,
        action_type,
        COUNT(*) as count
      FROM user_activities
      WHERE user_id = ? AND created_at >= ? AND created_at <= ?
      GROUP BY DATE(created_at), action_type
      ORDER BY date DESC, action_type`,
      [parseInt(userId), startDate.toISOString(), endDate.toISOString()]
    );

    // Get recent activities (last 20)
    const recentActivities = await db.all(
      `SELECT *
      FROM user_activities
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT 20`,
      [parseInt(userId)]
    );

    // Calculate total activities
    const totalActivitiesResult = await db.get(
      `SELECT COUNT(*) as total
      FROM user_activities
      WHERE user_id = ? AND created_at >= ? AND created_at <= ?`,
      [parseInt(userId), startDate.toISOString(), endDate.toISOString()]
    );

    // Get contacts touched count
    const contactsTouchedResult = await db.get(
      `SELECT COUNT(DISTINCT contact_id) as count
      FROM user_activities
      WHERE user_id = ? AND contact_id IS NOT NULL AND created_at >= ? AND created_at <= ?`,
      [parseInt(userId), startDate.toISOString(), endDate.toISOString()]
    );

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        days: parseInt(days)
      },
      summary: {
        totalActivities: totalActivitiesResult.total,
        contactsTouched: contactsTouchedResult.count,
        byActionType: activitySummary
      },
      dailyActivity,
      recentActivities
    });
  } catch (err) {
    console.error('Error fetching user analytics:', err);
    next(err);
  }
});

// GET /admin/audit-logs - Get audit logs (superadmin only)
router.get('/audit-logs', role('superadmin'), async (req, res, next) => {
  try {
    const { adminId, actionType, targetUserId, startDate, endDate, limit, offset } = req.query;

    const logs = await getAuditLogs({
      adminId: adminId ? parseInt(adminId) : null,
      actionType,
      targetUserId: targetUserId ? parseInt(targetUserId) : null,
      startDate,
      endDate,
      limit: limit ? parseInt(limit) : 100,
      offset: offset ? parseInt(offset) : 0
    });

    res.json({ logs });
  } catch (err) {
    console.error('Error fetching audit logs:', err);
    next(err);
  }
});

module.exports = router;