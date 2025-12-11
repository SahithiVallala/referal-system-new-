// backend/db.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const blobStorage = require('./blobStorage');

// Always use local path - blob storage handles persistence
const dbFile = path.join(__dirname, 'tracker.db');

const db = new sqlite3.Database(dbFile, async (err) => {
  if (err) {
    console.error('❌ Failed to connect to SQLite:', err.message);
  } else {
    if (process.env.VERBOSE === 'true') {
      console.log('✅ Connected to SQLite database');
    }
    
    // Initialize blob storage sync
    await blobStorage.initialize();
  }
});

// Promisify db.run / db.get / db.all
const run = (sql, params=[]) => new Promise((resolve, reject) => {
  db.run(sql, params, function(err){
    if(err) reject(err);
    else resolve({ id: this.lastID, changes: this.changes });
  });
});

const get = (sql, params=[]) => new Promise((resolve, reject) => {
  db.get(sql, params, (err, row) => {
    if(err) reject(err);
    else resolve(row);
  });
});

const all = (sql, params=[]) => new Promise((resolve, reject) => {
  db.all(sql, params, (err, rows) => {
    if(err) reject(err);
    else resolve(rows);
  });
});

// Initialize tables
(async () => {
  // Create users table for authentication
  await run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    isActive INTEGER DEFAULT 1,
    createdAt TEXT
  )`);

  // Create imports table to track Excel file imports
  await run(`CREATE TABLE IF NOT EXISTS imports (
    id TEXT PRIMARY KEY,
    filename TEXT,
    imported_at TEXT,
    added_count INTEGER,
    skipped_count INTEGER
  )`);

  await run(`CREATE TABLE IF NOT EXISTS contacts (
    id TEXT PRIMARY KEY,
    name TEXT,
    email TEXT,
    phone TEXT,
    company TEXT,
    designation TEXT,
    added_at TEXT,
    import_id TEXT
  )`);

  await run(`CREATE TABLE IF NOT EXISTS contact_logs (
    id TEXT PRIMARY KEY,
    contact_id TEXT,
    contacted_at TEXT,
    contacted_by TEXT,
    response TEXT,
    follow_up_date TEXT,
    notes TEXT,
    follow_up_completed INTEGER DEFAULT 0,
    follow_up_completed_at TEXT
  )`);

  await run(`CREATE TABLE IF NOT EXISTS requirements (
    id TEXT PRIMARY KEY,
    contact_id TEXT,
    role TEXT,
    experience TEXT,
    skills TEXT,
    openings INTEGER,
    description TEXT,
    created_at TEXT
  )`);

  // Create user_activities table to track user actions
  await run(`CREATE TABLE IF NOT EXISTS user_activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    user_name TEXT,
    user_email TEXT,
    action_type TEXT NOT NULL,
    action_description TEXT,
    contact_id TEXT,
    contact_name TEXT,
    metadata TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id)
  )`);

  // Create audit_logs table to track admin actions
  await run(`CREATE TABLE IF NOT EXISTS audit_logs (
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
  )`);

  // Migration: Add follow-up completion columns if they don't exist
  try {
    await run(`ALTER TABLE contact_logs ADD COLUMN follow_up_completed INTEGER DEFAULT 0`);
    await run(`ALTER TABLE contact_logs ADD COLUMN follow_up_completed_at TEXT`);
    console.log('Migration: Added follow-up completion columns');
  } catch (err) {
    // Columns already exist, ignore error
    if (!err.message.includes('duplicate column name')) {
      console.error('Migration error:', err.message);
    }
  }
})();

module.exports = { db, run, get, all };
