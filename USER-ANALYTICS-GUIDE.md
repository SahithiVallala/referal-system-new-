# User Analytics & Activity Tracking - Implementation Guide

## Overview

This implementation provides Super Admin and Admin users with comprehensive visibility into user activities within the referral system. Admins can now track what users are doing on a daily and weekly basis, including contacts touched, imports made, and other key actions.

---

## Features Implemented

### 1. **Backend Enhancements**

#### New API Endpoint
- **Endpoint**: `GET /admin/users/:userId/analytics`
- **Access**: Admin and Super Admin only
- **Query Parameters**:
  - `days` (optional): Number of days to analyze (default: 30)
  - Options: 7, 14, 30, 60, 90 days
- **Location**: `backend/routes/admin.js:247-342`

#### Response Structure
```json
{
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user"
  },
  "period": {
    "startDate": "2025-11-02T...",
    "endDate": "2025-12-02T...",
    "days": 30
  },
  "summary": {
    "totalActivities": 45,
    "contactsTouched": 23,
    "byActionType": [
      {
        "action_type": "CONTACT_LOG",
        "count": 25,
        "last_activity": "2025-12-02T10:30:00Z"
      },
      {
        "action_type": "IMPORT_CONTACTS",
        "count": 10,
        "last_activity": "2025-12-01T14:20:00Z"
      }
    ]
  },
  "dailyActivity": [
    {
      "date": "2025-12-02",
      "action_type": "CONTACT_LOG",
      "count": 5
    }
  ],
  "recentActivities": [
    {
      "id": 1,
      "user_id": 1,
      "action_type": "CONTACT_LOG",
      "action_description": "Contacted John Smith - Response: interested",
      "contact_name": "John Smith",
      "created_at": "2025-12-02T10:30:00Z"
    }
  ]
}
```

#### Activity Tracking Enhancements
Enhanced activity logging in the following routes:

**Contacts Routes** (`backend/routes/contacts.js`):
- ✅ Authentication enabled (line 14)
- ✅ ADD_CONTACT - When a user manually adds a new contact (lines 47-59)
- ✅ IMPORT_CONTACTS - When a user imports contacts via Excel (lines 458-472)
- ✅ CONTACT_LOG - When a user logs contact interaction (lines 596-608)
- ✅ DELETE_CONTACT - When a user deletes a contact (lines 168-180)

**Requirements Routes** (`backend/routes/requirements.js`):
- ✅ Authentication enabled (line 11)
- ✅ ADD_REQUIREMENT - When a user adds a job requirement (lines 44-57)
- ✅ EXPORT_REQUIREMENTS - When a user exports requirements to Excel (lines 95-105)

### 2. **Frontend Components**

#### UserAnalytics Modal Component
- **Location**: `frontend/src/components/UserAnalytics.jsx`
- **Features**:
  - 📊 Summary cards showing total activities, contacts touched, and activity types
  - 📈 Activity breakdown by type with icons and counts
  - 📅 Daily activity timeline
  - 📋 Recent activities log (last 20 actions)
  - ⏰ Flexible time period selector (7, 14, 30, 60, 90 days)
  - 🎨 Beautiful, modern UI with gradients and icons

#### Updated Admin Users Page
- **Location**: `frontend/src/pages/AdminUsers.jsx`
- **Changes**:
  - Added "Analytics" column to user table (line 247)
  - Added "View" button for each user to open analytics modal (lines 289-300)
  - Integrated UserAnalytics modal component (lines 334-341)

---

## Activity Types Tracked

| Action Type | Description | When Triggered |
|------------|-------------|----------------|
| **ADD_CONTACT** | User manually adds a contact | POST /contacts |
| **IMPORT_CONTACTS** | User imports contacts from Excel | POST /contacts/import |
| **CONTACT_LOG** | User logs contact interaction | POST /contacts/:id/log |
| **DELETE_CONTACT** | User deletes a contact | DELETE /contacts/:id |
| **ADD_REQUIREMENT** | User adds job requirement | POST /requirements |
| **EXPORT_REQUIREMENTS** | User exports requirements | GET /requirements/export |

---

## How to Use

### For Super Admin / Admin:

1. **Navigate to User Management**:
   - Login as Super Admin or Admin
   - Click on "Manage Users" or navigate to `/admin/users`

2. **View User Analytics**:
   - In the user table, locate the "Analytics" column
   - Click the blue "View" button next to any user

3. **Explore Analytics**:
   - **Summary Cards**: See total activities, contacts touched, and activity types
   - **Activity Breakdown**: View detailed breakdown by action type
   - **Daily Activity**: See day-by-day activity trends
   - **Recent Activities**: Browse the last 20 actions performed by the user

4. **Adjust Time Period**:
   - Use the dropdown at the top to select: Last 7, 14, 30, 60, or 90 days
   - Analytics will automatically refresh

---

## Testing Guide

### Step 1: Prepare Test Data

1. **Create Test Users**:
   ```bash
   # Login as Super Admin
   # Navigate to /admin/users
   # Create test users with different roles
   ```

2. **Perform Activities as Test User**:
   - Login as a regular user
   - Import contacts from Excel
   - Manually add a few contacts
   - Log contact interactions
   - Add requirements
   - Delete a contact

### Step 2: View Analytics

1. **Login as Admin/Super Admin**
2. Navigate to `/admin/users`
3. Click "View" button in the Analytics column for the test user
4. Verify:
   - ✅ Summary cards show correct counts
   - ✅ Activity breakdown displays all action types
   - ✅ Daily activity timeline is accurate
   - ✅ Recent activities list shows latest actions

### Step 3: Test Different Time Periods

1. Select "Last 7 days" - Verify only recent activities show
2. Select "Last 30 days" - Verify all activities within 30 days show
3. Select "Last 90 days" - Verify extended history is available

### Step 4: Test Edge Cases

1. **New User (No Activities)**:
   - Create a brand new user
   - View their analytics
   - Should see "No Activity Yet" message

2. **High Activity User**:
   - Use a user with many activities
   - Verify pagination and scrolling work properly

---

## Database Schema

The following tables support this feature:

### user_activities
```sql
CREATE TABLE user_activities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  user_name TEXT,
  user_email TEXT,
  action_type TEXT NOT NULL,
  action_description TEXT,
  contact_id TEXT,
  contact_name TEXT,
  metadata TEXT,  -- JSON string with additional data
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id)
);
```

### audit_logs
```sql
CREATE TABLE audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  admin_id INTEGER NOT NULL,
  admin_name TEXT,
  admin_email TEXT,
  admin_role TEXT,
  action_type TEXT NOT NULL,
  action_description TEXT,
  target_user_id INTEGER,
  target_user_name TEXT,
  target_user_email TEXT,
  old_value TEXT,
  new_value TEXT,
  metadata TEXT,
  created_at TEXT NOT NULL,
  FOREIGN KEY (admin_id) REFERENCES users(id),
  FOREIGN KEY (target_user_id) REFERENCES users(id)
);
```

---

## Security & Permissions

### Role-Based Access Control

| Feature | User | Admin | Super Admin |
|---------|------|-------|-------------|
| View own analytics | ❌ | ❌ | ❌ |
| View other users' analytics | ❌ | ✅ | ✅ |
| View audit logs | ❌ | ❌ | ✅ |
| Manage users | ❌ | ✅ | ✅ |

### Authentication
- All contact and requirement routes now require authentication
- Activity tracking only works for authenticated users
- `req.user` object must be present for logging

---

## Example Use Cases

### 1. Daily Performance Review
**Scenario**: Super Admin wants to see what User A did today

**Steps**:
1. Navigate to /admin/users
2. Click "View" next to User A
3. Select "Last 7 days"
4. Review "Daily Activity" section for today's date

**Result**: See breakdown like:
- Contacted 5 people
- Imported 50 contacts
- Added 2 requirements

### 2. Weekly Team Report
**Scenario**: Admin needs to compile weekly team activities

**Steps**:
1. For each team member:
   - Open their analytics
   - Select "Last 7 days"
   - Note total activities and contacts touched
2. Compare performance across team

### 3. User Productivity Tracking
**Scenario**: Identify most active users this month

**Steps**:
1. Open analytics for each user
2. Select "Last 30 days"
3. Compare "Total Activities" metric
4. Review "Activity Breakdown" to understand work patterns

---

## Troubleshooting

### Issue: "No Activity Yet" shows but user has been active

**Possible Causes**:
1. Activities were performed before authentication was enabled
2. Time period selected doesn't include recent activity
3. Database not recording activities properly

**Solution**:
1. Check if authentication is enabled in routes
2. Extend time period to 90 days
3. Verify database tables exist and have data

### Issue: Analytics not loading

**Possible Causes**:
1. Backend API endpoint not accessible
2. User doesn't have proper permissions
3. Network error

**Solution**:
1. Check browser console for errors
2. Verify user role is admin or superadmin
3. Check backend server is running

---

## Future Enhancements

Potential improvements for the analytics feature:

1. **Export Analytics**: Download user activity reports as PDF/Excel
2. **Charts & Graphs**: Visualize activity trends with charts
3. **Comparative Analytics**: Compare multiple users side-by-side
4. **Real-time Updates**: Live activity feed with WebSockets
5. **Custom Date Ranges**: Allow selecting specific start/end dates
6. **Activity Heatmap**: Calendar view showing activity intensity
7. **Performance Metrics**: Calculate KPIs like contacts per day, response rates
8. **Email Reports**: Schedule automated weekly/monthly reports

---

## Files Modified

### Backend
- ✅ `backend/routes/admin.js` - Added user analytics endpoint
- ✅ `backend/routes/contacts.js` - Enabled auth & added activity logging
- ✅ `backend/routes/requirements.js` - Enabled auth & added activity logging

### Frontend
- ✅ `frontend/src/components/UserAnalytics.jsx` - New analytics modal component
- ✅ `frontend/src/pages/AdminUsers.jsx` - Added analytics button and integration

### Database
- ✅ `backend/db.js` - Tables already existed (user_activities, audit_logs)

### Utilities
- ✅ `backend/utils/activityLogger.js` - Already existed, no changes needed

---

## Conclusion

This implementation provides comprehensive user activity tracking and analytics for your referral system. Super Admins and Admins can now:

- ✅ Monitor user productivity in real-time
- ✅ Track daily, weekly, and monthly activity patterns
- ✅ Identify most active users and action types
- ✅ Review detailed activity logs with timestamps
- ✅ Analyze contact engagement metrics

The system is production-ready and can be extended with additional features as needed.
