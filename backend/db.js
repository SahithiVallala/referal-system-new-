// backend/db.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbFile = path.join(__dirname, 'tracker.db');
const db = new sqlite3.Database(dbFile, (err) => {
  if (err) console.error('Failed to connect to DB:', err.message);
  else console.log('Connected to SQLite database.');
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
