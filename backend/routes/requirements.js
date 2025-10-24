// backend/routes/requirements.js
const express = require('express');
const router = express.Router();
const { run, all } = require('../db');
const { v4: uuidv4 } = require('uuid');
const ExcelJS = require('exceljs');

// Get all requirements
router.get('/', async (req, res) => {
  try {
    const rows = await all(`
      SELECT r.*, c.name as contact_name, c.email, c.phone, c.company, c.designation
      FROM requirements r 
      LEFT JOIN contacts c ON r.contact_id = c.id
      ORDER BY r.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create requirement
router.post('/', async (req, res) => {
  try {
    const { contact_id, role, experience, skills, openings, description } = req.body;
    if (!contact_id || !role) return res.status(400).json({ error: 'contact_id and role required' });

    const id = uuidv4();
    const created_at = new Date().toISOString();

    await run(
      'INSERT INTO requirements (id,contact_id,role,experience,skills,openings,description,created_at) VALUES (?,?,?,?,?,?,?,?)',
      [id, contact_id, role, experience||'', skills||'', openings||0, description||'', created_at]
    );

    const rows = await all('SELECT * FROM requirements WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Export requirements to Excel
router.get('/export', async (req, res) => {
  try {
    const rows = await all(`
      SELECT r.*, c.name as contact_name, c.email, c.phone, c.company, c.designation
      FROM requirements r 
      LEFT JOIN contacts c ON r.contact_id = c.id
      ORDER BY r.created_at DESC
    `);

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Requirements');

    sheet.columns = [
      { header: 'Requirement ID', key: 'id', width: 36 },
      { header: 'Contact Name', key: 'contact_name', width: 24 },
      { header: 'Email', key: 'email', width: 24 },
      { header: 'Phone', key: 'phone', width: 16 },
      { header: 'Company', key: 'company', width: 20 },
      { header: 'Designation', key: 'designation', width: 20 },
      { header: 'Role', key: 'role', width: 20 },
      { header: 'Experience', key: 'experience', width: 12 },
      { header: 'Skills', key: 'skills', width: 40 },
      { header: 'Openings', key: 'openings', width: 10 },
      { header: 'Description', key: 'description', width: 50 },
      { header: 'Created At', key: 'created_at', width: 24 }
    ];

    rows.forEach(r => sheet.addRow(r));

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=requirements.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
