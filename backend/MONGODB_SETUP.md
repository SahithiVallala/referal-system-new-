# MongoDB Atlas Setup Guide

## Quick Setup (Free Tier)

1. **Go to MongoDB Atlas**: https://www.mongodb.com/atlas
2. **Sign up** for a free account
3. **Create a new cluster** (choose the free tier M0)
4. **Create a database user**:
   - Go to Database Access
   - Add New Database User
   - Username: `admin`
   - Password: `admin123` (or create your own)
   - Built-in Role: `Atlas admin`

5. **Whitelist your IP**:
   - Go to Network Access
   - Add IP Address
   - Add Current IP Address (or use 0.0.0.0/0 for testing)

6. **Get connection string**:
   - Go to Clusters → Connect → Connect your application
   - Choose Node.js driver
   - Copy the connection string
   - Replace `<username>`, `<password>`, and `<dbname>` with your values

7. **Update your .env file**:
   ```
   MONGO_URI=mongodb+srv://admin:admin123@cluster0.xxxxx.mongodb.net/referalsystem?retryWrites=true&w=majority
   ```

## Alternative: Local MongoDB with Docker

If you have Docker installed:

```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

Then use: `MONGO_URI=mongodb://localhost:27017/referalsystem`

## Alternative: Download MongoDB Community

1. Go to: https://www.mongodb.com/try/download/community
2. Download MongoDB Community Server
3. Install with default settings
4. Start MongoDB service
5. Use: `MONGO_URI=mongodb://localhost:27017/referalsystem`