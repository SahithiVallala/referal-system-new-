# 🚀 RecruitConnect - Quick Start Guide

## Current Server Status

✅ **Auth Backend (Port 5001)**: Running  
✅ **App Backend (Port 4000)**: Running  
❌ **Frontend (Port 3000)**: Not running yet

---

## 🎯 How to Start All Servers

### Option 1: Use Startup Script (Recommended)
Double-click **`START_SERVERS.bat`** in the project root folder.  
This will automatically start both backend servers in separate windows.

### Option 2: Manual Startup

#### 1. Start Auth Backend (Port 5001)
```bash
cd backend
node index.js
```

#### 2. Start App Backend (Port 4000)  
Open **new terminal** and run:
```bash
cd backend
node server.js
```

#### 3. Start Frontend (Port 3000)  
Open **new terminal** and run:
```bash
cd frontend
npm start
```

---

## 🔑 Login Credentials

### Superadmin Account
```
Email: admin@example.com
Password: admin123
```

### Test Registration
1. Go to http://localhost:3000/register
2. Create new account (will have 'user' role)
3. Superadmin can promote users in "Manage Users"

---

## ❌ Troubleshooting Errors

### ERR_CONNECTION_REFUSED on port 5001
**Problem**: Auth backend not running  
**Solution**: 
```bash
cd backend
node index.js
```

### 401 Unauthorized on login
**Problem**: Invalid credentials  
**Solution**: Use correct email/password or create new account

### CORS PATCH method blocked
**Problem**: Old backend still running  
**Solution**: 
1. Close all node processes
2. Restart using START_SERVERS.bat

### Both backends running but login fails
**Problem**: MongoDB not running  
**Solution**:
```bash
docker start mongodb-referral
```
Or check: `docker ps` to see if MongoDB container is running

---

## 📝 Server Logs

### Auth Backend (Port 5001)
- Location: Terminal running `node index.js`
- Shows: Login attempts, token generation, user operations

### App Backend (Port 4000)
- Location: Terminal running `node server.js`
- Shows: Contact operations, requirements, follow-ups

---

## 🛑 Stopping Servers

**Option 1**: Close individual terminal windows  
**Option 2**: Press `Ctrl+C` in each terminal  
**Option 3**: Kill all node processes:
```powershell
Stop-Process -Name node -Force
```

---

## ✅ Verify Everything is Running

Run this in PowerShell:
```powershell
netstat -ano | findstr "LISTENING" | findstr ":3000 :4000 :5001"
```

Should show:
- Port 3000: Frontend
- Port 4000: App Backend  
- Port 5001: Auth Backend

---

## 📁 Important Files

| File | Purpose |
|------|---------|
| `START_SERVERS.bat` | Auto-start both backends |
| `AUTHENTICATION_FLOW.md` | Complete auth documentation |
| `backend/index.js` | Auth server (port 5001) |
| `backend/server.js` | App server (port 4000) |
| `backend/.env` | Server configuration |

---

## 🎯 Next Steps

1. ✅ Both backends are running
2. **Start frontend**: `cd frontend && npm start`
3. **Open browser**: http://localhost:3000
4. **Login** with superadmin credentials
5. **Explore** the application!

---

**Powered by TechGene** ❤️
