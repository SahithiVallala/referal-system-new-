# 🔐 RecruitConnect - Authentication & Authorization Architecture

## Overview
RecruitConnect uses a **JWT-based authentication system** with **Access + Refresh Token** strategy and **Role-Based Access Control (RBAC)** for secure user management.

---

## 🎯 Authentication Strategy: JWT Access + Refresh Tokens

### Why This Approach?
✅ **Prevents XSS token theft** (Refresh token in HttpOnly cookie)  
✅ **Users don't get logged out suddenly** (Auto-refresh mechanism)  
✅ **Most secure + widely used architecture** in modern web apps  
✅ **Scalable** - Stateless authentication, no server-side session storage

### Token Architecture

| Token Type | Storage Location | Lifetime | Purpose |
|------------|------------------|----------|---------|
| **Access Token** | React State/Context (Memory) | 15 minutes | API authorization |
| **Refresh Token** | HttpOnly Cookie | 7 days | Generate new access tokens |

#### How It Works:
1. **Login** → Server generates both tokens
2. **Access Token** → Sent in response body, stored in React state
3. **Refresh Token** → Set as HttpOnly cookie (JavaScript cannot access)
4. **API Requests** → Access token sent in `Authorization: Bearer <token>` header
5. **Token Expires** → Frontend automatically calls `/api/auth/refresh` to get new access token
6. **Logout** → Both tokens are cleared

---

## 🏗️ Backend Architecture

### Two Separate Backends

| Backend | Port | Database | Purpose |
|---------|------|----------|---------|
| **Auth Backend** | 5001 | MongoDB | User authentication, RBAC, user management |
| **App Backend** | 4000 | SQLite | Contacts, requirements, follow-ups |

### Why Two Backends?
- **Separation of Concerns**: Authentication logic isolated from business logic
- **Security**: User credentials and auth data in separate database
- **Scalability**: Can scale auth and app services independently

---

## 👥 Role-Based Access Control (RBAC)

### Three User Roles

| Role | Description | Capabilities |
|------|-------------|--------------|
| **👤 User** | Standard employee | • View contacts<br>• Add/edit contacts<br>• Add requirements<br>• View own follow-ups |
| **👨‍💼 Admin** | Team manager | **All User permissions +**<br>• View all users<br>• Activate/Deactivate users<br>• View system statistics<br>• Manage team members |
| **⭐ Superadmin** | System owner | **All Admin permissions +**<br>• Create new users<br>• Delete users<br>• **Change user roles**<br>• Full system control |

### Role Comparison Table

| Action | User | Admin | Superadmin |
|--------|------|-------|------------|
| View contacts | ✅ | ✅ | ✅ |
| Add/edit contacts | ✅ | ✅ | ✅ |
| View all users | ❌ | ✅ | ✅ |
| Activate/deactivate users | ❌ | ✅ | ✅ |
| Create new users | ❌ | ❌ | ✅ |
| Change user roles | ❌ | ❌ | ✅ |
| Delete users | ❌ | ❌ | ✅ |

---

## 🔄 Complete Authentication Flow

### 1️⃣ **User Registration Flow**

```
┌─────────────┐      POST /api/auth/register       ┌──────────────┐
│   Frontend  │ ────────────────────────────────▶ │ Auth Backend │
│  (Register  │  { name, email, password }         │   (Port 5001)│
│    Page)    │                                     └──────────────┘
└─────────────┘                                            │
                                                           │ 1. Validate data
                                                           │ 2. Hash password (bcrypt)
                                                           │ 3. Save to MongoDB
                                                           │ 4. Set default role: 'user'
                                                           │
                                                    ┌──────────────┐
                                                    │   MongoDB    │
                                                    │    Users     │
                                                    └──────────────┘
```

**Steps:**
1. User fills registration form (name, email, password)
2. Frontend sends POST to `/api/auth/register`
3. Backend validates input (email format, password length ≥ 6)
4. Password hashed using **bcrypt** (10 rounds)
5. User created in MongoDB with role = `'user'`
6. Success message returned
7. User redirected to login page

---

### 2️⃣ **User Login Flow**

```
┌─────────────┐      POST /api/auth/login          ┌──────────────┐
│   Frontend  │ ────────────────────────────────▶ │ Auth Backend │
│   (Login    │  { email, password }               │   (Port 5001)│
│    Page)    │                                     └──────────────┘
└─────────────┘                                            │
      ▲                                                    │ 1. Find user by email
      │                                                    │ 2. Compare password (bcrypt)
      │                                                    │ 3. Generate tokens
      │                                                    │
      │         Response: {                                │
      │           user: { id, name, email, role },         │
      │           accessToken: "eyJhbGc..."                │
      │         }                                          │
      │         Set-Cookie: refreshToken=...; HttpOnly     │
      └────────────────────────────────────────────────────┘
                                  │
                                  ▼
                    ┌─────────────────────────────┐
                    │   AuthContext (React)        │
                    │   • Store user in state      │
                    │   • Store accessToken        │
                    │   • Refresh token in cookie  │
                    └─────────────────────────────┘
```

**Steps:**
1. User enters email + password
2. Frontend sends POST to `/api/auth/login`
3. Backend finds user in MongoDB
4. Password verified using `bcrypt.compare()`
5. If valid:
   - Generate **Access Token** (JWT, expires in 15 min)
   - Generate **Refresh Token** (JWT, expires in 7 days)
   - Set refresh token as **HttpOnly cookie**
   - Return access token + user data in response
6. Frontend stores:
   - User data in React Context
   - Access token in memory
7. User redirected to dashboard

---

### 3️⃣ **Protected API Request Flow**

```
┌─────────────┐      GET /api/admin/users          ┌──────────────┐
│   Frontend  │ ────────────────────────────────▶ │ Auth Backend │
│  (Dashboard)│  Headers:                          │   (Port 5001)│
│             │  Authorization: Bearer <token>     └──────────────┘
└─────────────┘                                            │
                                                           │ 1. Extract token
                                                           │ 2. Verify JWT signature
                                                           │ 3. Check expiration
                                                           │ 4. Decode user info
                                                           │ 5. Check role (admin/superadmin)
                                                           │
                                             ✅ Authorized │
                                                           ▼
                                                    Return user list
```

**Steps:**
1. User clicks "Manage Users"
2. Frontend sends GET to `/api/admin/users`
3. **Axios interceptor** adds `Authorization: Bearer <accessToken>` header
4. Backend middleware `authCtrl.protect`:
   - Extracts token from header
   - Verifies JWT signature using secret key
   - Checks expiration
   - Decodes user info (id, role)
   - Attaches user to `req.user`
5. Role middleware `role(['admin', 'superadmin'])`:
   - Checks if user role matches required roles
   - If not → 403 Forbidden
6. If authorized → Returns user list

---

### 4️⃣ **Token Refresh Flow (Auto-Renew)**

```
┌─────────────┐                                    ┌──────────────┐
│   Frontend  │  ─────  Access Token Expired  ───▶│ Auth Backend │
│  (Auto)     │      POST /api/auth/refresh        │   (Port 5001)│
│             │      Cookie: refreshToken=...      └──────────────┘
└─────────────┘                                            │
      ▲                                                    │ 1. Extract refresh token from cookie
      │                                                    │ 2. Verify refresh token
      │                                                    │ 3. Check user still exists
      │                                                    │ 4. Generate new access token
      │                                                    │
      │         Response: {                                │
      │           accessToken: "new_token..."              │
      │         }                                          │
      └────────────────────────────────────────────────────┘
                                  │
                                  ▼
                       Update accessToken in state
                       Retry original request
```

**Steps:**
1. Access token expires (after 15 minutes)
2. API request returns 401 Unauthorized
3. **Axios response interceptor** catches error
4. Automatically calls `/api/auth/refresh`
5. Refresh token sent via HttpOnly cookie
6. Backend verifies refresh token
7. If valid → Generate new access token
8. Return new access token
9. Frontend updates token in memory
10. **Retry original request** with new token

---

### 5️⃣ **Logout Flow**

```
┌─────────────┐      POST /api/auth/logout         ┌──────────────┐
│   Frontend  │ ────────────────────────────────▶ │ Auth Backend │
│  (Header)   │  Cookie: refreshToken=...          │   (Port 5001)│
└─────────────┘                                     └──────────────┘
                                                           │
                                                           │ 1. Clear refresh token cookie
                                                           │ 2. (Optional) Blacklist token
                                                           │
                                                           ▼
                                                    Response: 200 OK
                                                    Set-Cookie: refreshToken=; expires=...
      ┌────────────────────────────────────────────────────┘
      │
      ▼
┌─────────────┐
│  AuthContext│
│  • Clear user state
│  • Clear accessToken
│  • Redirect to login
└─────────────┘
```

**Steps:**
1. User clicks "Sign Out"
2. Frontend sends POST to `/api/auth/logout`
3. Backend clears refresh token cookie
4. Frontend clears:
   - User state
   - Access token
5. Redirect to login page

---

## 🗄️ Database Schema

### MongoDB - Users Collection

```javascript
{
  _id: ObjectId,
  name: String,              // Full name
  email: String,             // Unique, lowercase
  password: String,          // Bcrypt hashed
  role: String,              // 'user' | 'admin' | 'superadmin'
  isActive: Boolean,         // true/false
  createdAt: Date,           // Auto-generated
  updatedAt: Date            // Auto-updated
}
```

### SQLite - Application Data

```sql
-- Contacts table
CREATE TABLE contacts (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  company TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Contact logs (interactions)
CREATE TABLE contact_logs (
  id INTEGER PRIMARY KEY,
  contact_id INTEGER,
  contacted_by TEXT,
  contacted_at DATETIME,
  response TEXT,  -- 'yes', 'no', or NULL
  notes TEXT,
  follow_up_date DATE,
  FOREIGN KEY (contact_id) REFERENCES contacts(id)
);

-- Requirements
CREATE TABLE requirements (
  id INTEGER PRIMARY KEY,
  contact_id INTEGER,
  role TEXT,
  company TEXT,
  experience TEXT,
  created_at DATETIME,
  FOREIGN KEY (contact_id) REFERENCES contacts(id)
);
```

---

## 🔒 Security Features

### 1. Password Security
- **Bcrypt hashing** with 10 salt rounds
- Never store plain text passwords
- Passwords required to be ≥ 6 characters

### 2. Token Security
- Access tokens expire in 15 minutes
- Refresh tokens in HttpOnly cookies (XSS protection)
- JWT signature verification
- Secret keys in environment variables

### 3. CORS Protection
```javascript
// Only allow frontend origin
cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
})
```

### 4. Role Middleware
```javascript
// Protect routes by role
router.get('/admin/users', 
  authCtrl.protect,              // Must be logged in
  role(['admin', 'superadmin'])  // Must have role
);
```

---

## 📁 File Structure

```
backend/
├── index.js                    # Auth server (port 5001)
├── server.js                   # App server (port 4000)
├── controllers/
│   └── authController.js       # Auth logic
├── middleware/
│   └── roleMiddleware.js       # RBAC logic
├── models/
│   └── User.js                 # MongoDB user model
└── routes/
    ├── auth.js                 # /api/auth/* routes
    └── admin.js                # /api/admin/* routes

frontend/
├── src/
│   ├── context/
│   │   └── AuthContext.jsx     # Global auth state
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   └── AdminUsers.jsx
│   ├── components/
│   │   └── ProtectedRoute.jsx  # Route guard
│   └── api/
│       └── axios.js            # API client with interceptors
```

---

## 🚀 API Endpoints

### Authentication Endpoints (Port 5001)

| Method | Endpoint | Auth Required | Role Required | Description |
|--------|----------|---------------|---------------|-------------|
| POST | `/api/auth/register` | ❌ | - | Create new user account |
| POST | `/api/auth/login` | ❌ | - | Login and get tokens |
| POST | `/api/auth/refresh` | ✅ (Refresh Token) | - | Get new access token |
| POST | `/api/auth/logout` | ✅ | - | Clear tokens and logout |
| GET | `/api/auth/me` | ✅ | - | Get current user info |

### Admin Endpoints (Port 5001)

| Method | Endpoint | Auth Required | Role Required | Description |
|--------|----------|---------------|---------------|-------------|
| GET | `/api/admin/users` | ✅ | Admin/Superadmin | List all users |
| POST | `/api/admin/create-user` | ✅ | **Superadmin** | Create new user |
| PATCH | `/api/admin/users/:id/role` | ✅ | **Superadmin** | Change user role |
| PATCH | `/api/admin/users/:id/status` | ✅ | Admin/Superadmin | Activate/deactivate user |
| DELETE | `/api/admin/users/:id` | ✅ | **Superadmin** | Delete user permanently |

### Application Endpoints (Port 4000)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/contacts` | List all contacts |
| POST | `/api/contacts` | Create new contact |
| GET | `/api/requirements` | List all job requirements |
| GET | `/api/contacts/followups/all` | Get all follow-ups |
| GET | `/api/contacts/followups/pending` | Get today's follow-ups |

---

## 🎨 Frontend Components

### AuthContext (Global State)
```javascript
// Provides to entire app:
{
  user: { id, name, email, role },
  accessToken: "jwt_token",
  login: (email, password) => Promise,
  register: (name, email, password) => Promise,
  logout: () => void,
  loading: boolean
}
```

### ProtectedRoute Component
```javascript
// Protects routes based on authentication + role
<ProtectedRoute allowedRoles={['admin', 'superadmin']}>
  <AdminUsers />
</ProtectedRoute>
```

---

## ⚙️ Environment Variables

### Backend (.env)
```env
PORT=5001
MONGO_URI=mongodb://localhost:27017/referalsystem
JWT_ACCESS_SECRET=your_super_secret_access_key
JWT_REFRESH_SECRET=your_super_secret_refresh_key
NODE_ENV=development
```

---

## 🔧 Troubleshooting

### Issue: 401 Unauthorized
**Cause**: Invalid credentials or expired token  
**Solution**: Re-login with correct credentials

### Issue: 403 Forbidden
**Cause**: User doesn't have required role  
**Solution**: Check user role in database, ensure proper permissions

### Issue: ERR_CONNECTION_REFUSED on port 5001
**Cause**: Auth backend not running  
**Solution**: 
```bash
cd backend
node index.js
```

### Issue: Cannot access /admin/users
**Cause**: Not logged in as admin/superadmin  
**Solution**: Login with admin credentials:
- Email: `admin@example.com`
- Password: `admin123`

---

## 📝 Default Credentials

### Superadmin Account
```
Email: admin@example.com
Password: admin123
Role: superadmin
```

**⚠️ IMPORTANT:** Change these credentials in production!

---

## ✅ Best Practices Implemented

1. ✅ **Never store passwords in plain text** - Bcrypt hashing
2. ✅ **Refresh tokens in HttpOnly cookies** - XSS protection
3. ✅ **Short-lived access tokens** - Minimize damage if stolen
4. ✅ **Role-based access control** - Principle of least privilege
5. ✅ **Environment variables for secrets** - No hardcoded keys
6. ✅ **CORS protection** - Only allow trusted origins
7. ✅ **JWT signature verification** - Prevent token tampering
8. ✅ **Separate auth and app logic** - Better security & scalability

---

**Built with ❤️ by TechGene**
