# RecruitConnect - Startup Guide

## 🚀 Quick Start (Recommended Method)

### Option 1: Use the Startup Script (Easiest)
```bash
# Double-click this file:
start-app.bat
```

This script will:
- ✅ Automatically kill any processes on ports 5001 and 3000
- ✅ Start the backend server on port 5001
- ✅ Start the frontend server on port 3000
- ✅ Clean up everything when you close it

### Option 2: Manual Start
```bash
# Terminal 1 - Start Backend
cd backend
node index.js

# Terminal 2 - Start Frontend
cd frontend
npm start
```

## 🔧 Port Configuration

### Fixed Ports (DO NOT CHANGE)
- **Backend**: `5001` (configured in `backend/.env`)
- **Frontend**: `3000` (default React port)

### Why These Ports?
- Port 5001 is used exclusively for the backend API
- Port 3000 is the standard React development port
- CORS is configured to allow localhost:3000 to access localhost:5001

## 🔐 Authentication & 401 Errors - PERMANENT FIX

### What Was Fixed:
1. **Automatic Token Refresh** - When your token expires, the app automatically tries to refresh it
2. **Auto-Redirect on 401** - If authentication fails, you're automatically redirected to login
3. **Better Error Recovery** - The app handles authentication errors gracefully

### What This Means For You:
- ✅ No more stuck on 401 errors
- ✅ Automatic login page redirect when session expires
- ✅ Seamless token refresh in the background
- ✅ Better error messages

### Files Modified:
- `frontend/src/context/AuthContext.jsx` - Added response interceptor for 401 handling
- `backend/routes/contacts.js` - Added authentication middleware
- `backend/routes/admin.js` - Protected admin routes

## 🆘 Troubleshooting

### Problem: "Port 5001 is already in use"
**Solution**: The backend is already running. Either:
1. Use `start-app.bat` which auto-kills old processes, OR
2. Manually kill the process:
```bash
# Find and kill process on port 5001
netstat -ano | findstr :5001
taskkill /F /PID <PID_NUMBER>
```

### Problem: "401 Unauthorized" errors
**Solution**: This means you need to log in again:
1. The app will automatically redirect you to `/login`
2. Log in with your credentials
3. Your session will be restored

### Problem: Backend server won't start
**Solution**:
1. Check if port 5001 is already in use
2. Make sure `backend/.env` file exists with `PORT=5001`
3. Run `npm install` in the backend folder

### Problem: Frontend won't connect to backend
**Solution**:
1. Make sure backend is running on port 5001
2. Check `frontend/.env.local` has `REACT_APP_API_URL=http://localhost:5001/api`
3. Clear browser cache and reload

## 📝 Default Login Credentials

### Superadmin Account
- **Email**: `admin@example.com`
- **Password**: `admin123`
- **Role**: `superadmin` (Full access)

## 🔄 After Restarting the Backend

When you restart the backend server:
1. ✅ Old tokens become invalid (this is normal)
2. ✅ The app will automatically try to refresh your token
3. ✅ If refresh fails, you'll be redirected to login
4. ✅ Just log in again - your data is safe in the database

## 🎯 Key Features Implemented

### 1. Admin Protection
- Admins CANNOT modify superadmin accounts
- Admins CANNOT delete superadmins
- Only superadmins can manage other superadmins

### 2. Account Blocking
- Deactivated users see: "Your account has been blocked by an administrator"
- Clear messaging when accounts are disabled

### 3. Activity Tracking
- All user actions are logged (contacts, imports, etc.)
- Admin actions are tracked in audit logs
- Superadmins can see everything admins do

### 4. Analytics (API Endpoints)
- `GET /api/admin/analytics` - User activity analytics
- `GET /api/admin/audit-logs` - Admin action logs (superadmin only)

### 5. UI Improvements
- Column names updated: "Contacted By" and "Follow Ups"
- Larger font sizes for better readability
- Light emerald green for today's follow-ups

## 🛡️ Security Notes

### JWT Tokens
- Access tokens expire in 15 minutes
- Refresh tokens expire in 7 days
- Stored in HTTP-only cookies (secure)

### Password Requirements
- Minimum 6 characters
- Hashed with bcrypt before storage

## 📊 Database

### Location
- `backend/tracker.db` (SQLite database)
- Contains all contacts, logs, users, and activities

### Tables
- `users` - User accounts and roles
- `contacts` - Contact information
- `contact_logs` - Contact interaction history
- `requirements` - Job requirements
- `user_activities` - User action tracking
- `audit_logs` - Admin action tracking

## 🚨 Emergency Reset

If everything breaks:
1. Stop all servers (close terminal windows)
2. Delete these folders:
   - `backend/node_modules`
   - `frontend/node_modules`
3. Reinstall dependencies:
```bash
cd backend && npm install
cd ../frontend && npm install
```
4. Use `start-app.bat` to restart

## 📞 Support

If you encounter persistent issues:
1. Check this guide first
2. Verify all ports are correct (5001 and 3000)
3. Make sure both .env files exist and are configured correctly
4. Try the emergency reset procedure above

---

**Last Updated**: 2025-12-01
**Version**: 2.0 (with permanent auth fixes)
