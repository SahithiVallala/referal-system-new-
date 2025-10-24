// backend/routes/contacts.js
const express = require('express');
const router = express.Router();
const { run, get, all } = require('../db');
const { v4: uuidv4 } = require('uuid');
const multer = require('multer');
const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

// Configure multer for file uploads
const upload = multer({ 
  dest: 'uploads/',
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.xlsx' && ext !== '.xls') {
      return cb(new Error('Only Excel files are allowed'));
    }
    cb(null, true);
  }
});

// Add or find contact (prevent duplicate by email or phone)
router.post('/', async (req, res) => {
  try {
    const { name, email, phone, company, designation } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });
    if (!email && !phone) return res.status(400).json({ error: 'Provide at least email or phone' });

    const existing = await get('SELECT * FROM contacts WHERE email = ? OR phone = ?', [email||'', phone||'']);
    if (existing) return res.json({ existing: true, contact: existing });

    const id = uuidv4();
    const added_at = new Date().toISOString();
    await run(
      'INSERT INTO contacts (id,name,email,phone,company,designation,added_at) VALUES (?,?,?,?,?,?,?)',
      [id, name, email, phone, company, designation, added_at]
    );

    const contact = await get('SELECT * FROM contacts WHERE id = ?', [id]);
    res.json({ existing: false, contact });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get contact count (fast)
router.get('/count', async (req, res) => {
  try {
    const result = await get('SELECT COUNT(*) as count FROM contacts');
    res.json({ count: result.count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List contacts with latest contact log
router.get('/', async (req, res) => {
  try {
    const contacts = await all('SELECT * FROM contacts ORDER BY added_at DESC');
    const enriched = await Promise.all(
      contacts.map(async c => {
        const log = await get('SELECT * FROM contact_logs WHERE contact_id = ? ORDER BY contacted_at DESC LIMIT 1', [c.id]);
        return { ...c, latest_log: log };
      })
    );
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// List all imports with contact counts
router.get('/imports', async (req, res) => {
  try {
    const imports = await all(`
      SELECT 
        i.*,
        COUNT(c.id) as contact_count
      FROM imports i
      LEFT JOIN contacts c ON c.import_id = i.id
      GROUP BY i.id
      ORDER BY i.imported_at DESC
    `);
    res.json(imports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get contacts from a specific import
router.get('/imports/:id/contacts', async (req, res) => {
  try {
    const contacts = await all(
      'SELECT * FROM contacts WHERE import_id = ? ORDER BY added_at DESC',
      [req.params.id]
    );
    res.json(contacts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a specific import and its contacts
router.delete('/imports/:id', async (req, res) => {
  try {
    const importId = req.params.id;
    
    // Get contacts to delete their logs and requirements
    const contacts = await all('SELECT id FROM contacts WHERE import_id = ?', [importId]);
    const contactIds = contacts.map(c => c.id);
    
    if (contactIds.length > 0) {
      const placeholders = contactIds.map(() => '?').join(',');
      await run(`DELETE FROM contact_logs WHERE contact_id IN (${placeholders})`, contactIds);
      await run(`DELETE FROM requirements WHERE contact_id IN (${placeholders})`, contactIds);
    }
    
    // Delete contacts and import record
    await run('DELETE FROM contacts WHERE import_id = ?', [importId]);
    await run('DELETE FROM imports WHERE id = ?', [importId]);
    
    res.json({ message: 'Import and associated contacts deleted', deleted_contacts: contactIds.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Clear all contacts (for testing/reset)
router.delete('/clear-all', async (req, res) => {
  try {
    await run('DELETE FROM contact_logs');
    await run('DELETE FROM requirements');
    await run('DELETE FROM contacts');
    await run('DELETE FROM imports');
    res.json({ message: 'All contacts, logs, requirements, and imports cleared' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Bulk import contacts from Excel - OPTIMIZED for large datasets
router.post('/import', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(req.file.path);
    
    const worksheet = workbook.worksheets[0];
    const results = {
      added: 0,
      skipped: 0,
      errors: []
    };

    // Helper function to normalize header names
    const normalizeHeader = (header) => {
      if (!header) return '';
      return header.toString().toLowerCase().replace(/[\s_\-\.]+/g, '').trim();
    };

    // Helper function to match header to field type
    const matchHeaderToField = (normalized) => {
      // Name patterns
      if (/^(name|fullname|contactname|personname|employeename)/.test(normalized)) return 'name';
      // Email patterns
      if (/(email|mail|emailid|emailaddress|e?mail)/.test(normalized)) return 'email';
      // Phone patterns
      if (/(phone|mobile|contact|number|phonenumber|mobilenumber|contactnumber|telephone|cell)/.test(normalized)) return 'phone';
      // Company patterns
      if (/(company|organization|org|employer|business)/.test(normalized)) return 'company';
      // Designation patterns
      if (/(designation|role|title|position|jobtitle)/.test(normalized)) return 'designation';
      return null;
    };

    console.log('=== EXCEL IMPORT DEBUG ===');
    console.log('Total rows:', worksheet.rowCount);
    
    // Find header row by looking for rows with recognizable column names
    let headerRowIndex = -1;
    let dataStartRow = 2;
    let columnMap = {};
    
    for (let rowIndex = 1; rowIndex <= Math.min(10, worksheet.rowCount); rowIndex++) {
      const row = worksheet.getRow(rowIndex);
      const tempMap = {};
      let matchCount = 0;
      
      console.log(`\nChecking row ${rowIndex} for headers:`);
      
      for (let col = 1; col <= row.cellCount; col++) {
        const cellValue = row.getCell(col).value;
        if (!cellValue) continue;
        
        const normalized = normalizeHeader(cellValue);
        const fieldType = matchHeaderToField(normalized);
        
        console.log(`  Col ${col}: "${cellValue}" → normalized: "${normalized}" → field: ${fieldType}`);
        
        if (fieldType && !tempMap[fieldType]) {
          tempMap[fieldType] = col;
          matchCount++;
        }
      }
      
      // If we found at least 2 field types, this is likely the header row
      if (matchCount >= 2) {
        headerRowIndex = rowIndex;
        dataStartRow = rowIndex + 1;
        columnMap = tempMap;
        console.log(`✓ Found ${matchCount} headers in row ${rowIndex}`);
        break;
      }
    }
    
    // If no headers found, analyze data patterns
    if (headerRowIndex === -1) {
      console.log('\nNo headers detected. Analyzing data patterns...');
      dataStartRow = 1;
      
      // Analyze first few rows to detect column types
      for (let rowIndex = 1; rowIndex <= Math.min(5, worksheet.rowCount); rowIndex++) {
        const row = worksheet.getRow(rowIndex);
        console.log(`\nAnalyzing row ${rowIndex}:`);
        
        for (let col = 1; col <= Math.min(6, row.cellCount); col++) {
          const value = row.getCell(col).value?.toString()?.trim() || '';
          if (!value) continue;
          
          console.log(`  Col ${col}: "${value}"`);
          
          // Detect email (has @ and .)
          if (value.includes('@') && value.includes('.') && !columnMap.email) {
            columnMap.email = col;
            console.log(`    → Detected as EMAIL`);
          }
          // Detect phone (has digits, +, -, (, ), spaces)
          else if (/^[\d\s\-\+\(\)]{8,}$/.test(value) && !columnMap.phone) {
            columnMap.phone = col;
            console.log(`    → Detected as PHONE`);
          }
          // Detect name (text without @ or mostly numbers, length > 2)
          else if (value.length > 2 && !/[@\d]{3,}/.test(value) && !columnMap.name) {
            columnMap.name = col;
            console.log(`    → Detected as NAME`);
          }
        }
        
        // Stop if we found all three main fields
        if (columnMap.name && columnMap.email && columnMap.phone) break;
      }
    }
    
    // Set defaults for missing columns
    if (!columnMap.name) columnMap.name = 1;
    if (!columnMap.email) columnMap.email = 2;
    if (!columnMap.phone) columnMap.phone = 3;
    if (!columnMap.company) columnMap.company = 4;
    if (!columnMap.designation) columnMap.designation = 5;
    
    console.log('\n✓ Final column mapping:', columnMap);
    console.log('✓ Data starts at row:', dataStartRow);
    console.log('===========================\n');

    // First pass: collect all data from Excel (fast, no DB queries)
    const rowsData = [];
    for (let rowNumber = dataStartRow; rowNumber <= worksheet.rowCount; rowNumber++) {
      const row = worksheet.getRow(rowNumber);
      
      const name = row.getCell(columnMap.name).value?.toString()?.trim() || '';
      const email = row.getCell(columnMap.email).value?.toString()?.trim() || '';
      const phone = row.getCell(columnMap.phone).value?.toString()?.trim() || '';
      const company = row.getCell(columnMap.company).value?.toString()?.trim() || '';
      const designation = row.getCell(columnMap.designation).value?.toString()?.trim() || '';

      // Skip empty rows
      if (!name && !email && !phone) continue;

      rowsData.push({ rowNumber, name, email, phone, company, designation });
    }

    // Second pass: batch check existing contacts (handle SQLite 999 variable limit)
    const emails = rowsData.map(r => r.email).filter(e => e);
    const phones = rowsData.map(r => r.phone).filter(p => p);
    
    const existingSet = new Set();
    
    // SQLite has a limit of 999 variables, so we batch the queries
    const BATCH_SIZE = 400; // Safe limit to avoid hitting 999
    
    // Check emails in batches
    if (emails.length > 0) {
      for (let i = 0; i < emails.length; i += BATCH_SIZE) {
        const batch = emails.slice(i, i + BATCH_SIZE);
        const placeholders = batch.map(() => '?').join(',');
        const results = await all(
          `SELECT email FROM contacts WHERE email IN (${placeholders})`,
          batch
        );
        results.forEach(r => existingSet.add(r.email));
      }
    }
    
    // Check phones in batches
    if (phones.length > 0) {
      for (let i = 0; i < phones.length; i += BATCH_SIZE) {
        const batch = phones.slice(i, i + BATCH_SIZE);
        const placeholders = batch.map(() => '?').join(',');
        const results = await all(
          `SELECT phone FROM contacts WHERE phone IN (${placeholders})`,
          batch
        );
        results.forEach(r => existingSet.add(r.phone));
      }
    }
    
    console.log(`Checked ${emails.length} emails and ${phones.length} phones for duplicates`);

    // Create import record
    const importId = uuidv4();
    const importedAt = new Date().toISOString();
    
    // Third pass: batch insert new contacts using transaction
    const db = require('../db').db;
    await new Promise((resolve, reject) => {
      db.run('BEGIN TRANSACTION', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    try {
      // Save import metadata
      await run(
        'INSERT INTO imports (id, filename, imported_at, added_count, skipped_count) VALUES (?, ?, ?, ?, ?)',
        [importId, req.file.originalname, importedAt, 0, 0]
      );

      const stmt = db.prepare(
        'INSERT INTO contacts (id,name,email,phone,company,designation,added_at,import_id) VALUES (?,?,?,?,?,?,?,?)'
      );

      for (const data of rowsData) {
        // Check if exists in our Set
        const exists = (data.email && existingSet.has(data.email)) || 
                      (data.phone && existingSet.has(data.phone));

        if (exists) {
          results.skipped++;
          continue;
        }

        try {
          const id = uuidv4();
          const added_at = new Date().toISOString();
          await new Promise((resolve, reject) => {
            stmt.run([id, data.name, data.email, data.phone, data.company, data.designation, added_at, importId], 
              (err) => err ? reject(err) : resolve()
            );
          });
          results.added++;
          
          // Add to existing set to prevent duplicates within the same import
          if (data.email) existingSet.add(data.email);
          if (data.phone) existingSet.add(data.phone);
        } catch (err) {
          results.errors.push(`Row ${data.rowNumber}: ${err.message}`);
        }
      }

      stmt.finalize();

      // Update import counts
      await run(
        'UPDATE imports SET added_count = ?, skipped_count = ? WHERE id = ?',
        [results.added, results.skipped, importId]
      );

      // Commit transaction
      await new Promise((resolve, reject) => {
        db.run('COMMIT', (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    } catch (err) {
      // Rollback on error
      await new Promise((resolve) => {
        db.run('ROLLBACK', () => resolve());
      });
      throw err;
    }

    // Clean up uploaded file (with delay to avoid EBUSY error)
    setTimeout(() => {
      try {
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
      } catch (unlinkErr) {
        console.error('Failed to delete uploaded file:', unlinkErr.message);
      }
    }, 100);

    res.json(results);
  } catch (err) {
    // Clean up file on error
    setTimeout(() => {
      try {
        if (req.file && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
      } catch (unlinkErr) {
        console.error('Failed to delete uploaded file:', unlinkErr.message);
      }
    }, 100);
    res.status(500).json({ error: err.message });
  }
});

// Get pending follow-ups
router.get('/followups/pending', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Get all follow-ups that are due (today or past) and haven't been completed
    const followups = await all(`
      SELECT 
        cl.*,
        c.name,
        c.email,
        c.phone,
        c.company,
        c.designation
      FROM contact_logs cl
      JOIN contacts c ON c.id = cl.contact_id
      WHERE cl.follow_up_date IS NOT NULL 
        AND cl.follow_up_date <= ?
        AND (cl.follow_up_completed IS NULL OR cl.follow_up_completed = 0)
      ORDER BY cl.follow_up_date ASC
    `, [today]);
    
    res.json(followups);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all upcoming follow-ups
router.get('/followups/all', async (req, res) => {
  try {
    const followups = await all(`
      SELECT 
        cl.*,
        c.name,
        c.email,
        c.phone,
        c.company,
        c.designation
      FROM contact_logs cl
      JOIN contacts c ON c.id = cl.contact_id
      WHERE cl.follow_up_date IS NOT NULL
        AND (cl.follow_up_completed IS NULL OR cl.follow_up_completed = 0)
      ORDER BY cl.follow_up_date ASC
    `);
    
    res.json(followups);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark follow-up as completed
router.patch('/followups/:logId/complete', async (req, res) => {
  try {
    const logId = req.params.logId;
    
    // Add a new field to track follow-up completion without changing response status
    await run(
      'UPDATE contact_logs SET follow_up_completed = ?, follow_up_completed_at = ? WHERE id = ?',
      [1, new Date().toISOString(), logId]
    );
    
    const updatedLog = await get('SELECT * FROM contact_logs WHERE id = ?', [logId]);
    res.json(updatedLog);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add contact log
router.post('/:id/log', async (req, res) => {
  try {
    const contact_id = req.params.id;
    const { contacted_by, response, follow_up_date, notes } = req.body;
    const id = uuidv4();
    const contacted_at = new Date().toISOString();

    await run(
      'INSERT INTO contact_logs (id,contact_id,contacted_at,contacted_by,response,follow_up_date,notes) VALUES (?,?,?,?,?,?,?)',
      [id, contact_id, contacted_at, contacted_by||null, response||'pending', follow_up_date||null, notes||null]
    );

    const log = await get('SELECT * FROM contact_logs WHERE id = ?', [id]);
    res.json(log);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete all requirements
router.delete('/requirements/clear-all', async (req, res) => {
  try {
    await run('DELETE FROM requirements');
    res.json({ message: 'All requirements deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a requirement
router.delete('/requirements/:reqId', async (req, res) => {
  try {
    const reqId = req.params.reqId;
    await run('DELETE FROM requirements WHERE id = ?', [reqId]);
    res.json({ message: 'Requirement deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
