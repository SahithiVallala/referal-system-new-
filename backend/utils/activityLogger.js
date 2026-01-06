const db = require('../db');

// Log user activity (contact-related actions)
exports.logActivity = async ({
  userId,
  userName,
  userEmail,
  actionType,
  actionDescription,
  contactId = null,
  contactName = null,
  metadata = null
}) => {
  try {
    const metadataStr = metadata ? JSON.stringify(metadata) : null;

    await db.run(
      `INSERT INTO user_activities
       (user_id, user_name, user_email, action_type, action_description,
        contact_id, contact_name, metadata, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        userName,
        userEmail,
        actionType,
        actionDescription,
        contactId,
        contactName,
        metadataStr,
        new Date().toISOString()
      ]
    );
  } catch (err) {
    console.error('Error logging activity:', err);
  }
};

// Log admin action (administrative changes)
exports.logAudit = async ({
  adminId,
  adminName,
  adminEmail,
  adminRole,
  actionType,
  actionDescription,
  targetUserId = null,
  targetUserName = null,
  targetUserEmail = null,
  oldValue = null,
  newValue = null,
  metadata = null
}) => {
  try {
    const metadataStr = metadata ? JSON.stringify(metadata) : null;

    await db.run(
      `INSERT INTO audit_logs
       (admin_id, admin_name, admin_email, admin_role, action_type, action_description,
        target_user_id, target_user_name, target_user_email, old_value, new_value,
        metadata, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        adminId,
        adminName,
        adminEmail,
        adminRole,
        actionType,
        actionDescription,
        targetUserId,
        targetUserName,
        targetUserEmail,
        oldValue,
        newValue,
        metadataStr,
        new Date().toISOString()
      ]
    );
  } catch (err) {
    console.error('Error logging audit:', err);
  }
};

// Get user activities with pagination and filters
exports.getUserActivities = async ({ userId = null, actionType = null, startDate = null, endDate = null, limit = 100, offset = 0 }) => {
  try {
    let query = 'SELECT * FROM user_activities WHERE 1=1';
    const params = [];

    if (userId) {
      query += ' AND user_id = ?';
      params.push(userId);
    }

    if (actionType) {
      query += ' AND action_type = ?';
      params.push(actionType);
    }

    if (startDate) {
      query += ' AND created_at >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND created_at <= ?';
      params.push(endDate);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    return await db.all(query, params);
  } catch (err) {
    console.error('Error getting user activities:', err);
    return [];
  }
};

// Get audit logs (superadmin only)
exports.getAuditLogs = async ({ adminId = null, actionType = null, targetUserId = null, startDate = null, endDate = null, limit = 100, offset = 0 }) => {
  try {
    let query = 'SELECT * FROM audit_logs WHERE 1=1';
    const params = [];

    if (adminId) {
      query += ' AND admin_id = ?';
      params.push(adminId);
    }

    if (actionType) {
      query += ' AND action_type = ?';
      params.push(actionType);
    }

    if (targetUserId) {
      query += ' AND target_user_id = ?';
      params.push(targetUserId);
    }

    if (startDate) {
      query += ' AND created_at >= ?';
      params.push(startDate);
    }

    if (endDate) {
      query += ' AND created_at <= ?';
      params.push(endDate);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    return await db.all(query, params);
  } catch (err) {
    console.error('Error getting audit logs:', err);
    return [];
  }
};

// Get analytics for admin dashboard
exports.getAnalytics = async ({ userId = null, period = 'daily', startDate = null, endDate = null }) => {
  try {
    // Set default date range if not provided
    if (!startDate) {
      const date = new Date();
      date.setDate(date.getDate() - 30); // Last 30 days
      startDate = date.toISOString();
    }
    if (!endDate) {
      endDate = new Date().toISOString();
    }

    const query = userId
      ? `SELECT
           DATE(created_at) as date,
           action_type,
           COUNT(*) as count
         FROM user_activities
         WHERE user_id = ? AND created_at >= ? AND created_at <= ?
         GROUP BY DATE(created_at), action_type
         ORDER BY date DESC`
      : `SELECT
           DATE(created_at) as date,
           user_id,
           user_name,
           action_type,
           COUNT(*) as count
         FROM user_activities
         WHERE created_at >= ? AND created_at <= ?
         GROUP BY DATE(created_at), user_id, action_type
         ORDER BY date DESC, user_id`;

    const params = userId ? [userId, startDate, endDate] : [startDate, endDate];
    const activities = await db.all(query, params);

    // Get summary stats
    const summaryQuery = userId
      ? `SELECT
           action_type,
           COUNT(*) as total_count
         FROM user_activities
         WHERE user_id = ? AND created_at >= ? AND created_at <= ?
         GROUP BY action_type`
      : `SELECT
           user_id,
           user_name,
           action_type,
           COUNT(*) as total_count
         FROM user_activities
         WHERE created_at >= ? AND created_at <= ?
         GROUP BY user_id, action_type`;

    const summary = await db.all(summaryQuery, params);

    return {
      activities,
      summary,
      period: { startDate, endDate }
    };
  } catch (err) {
    console.error('Error getting analytics:', err);
    return { activities: [], summary: [], period: { startDate, endDate } };
  }
};
