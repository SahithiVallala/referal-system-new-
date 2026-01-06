const db = require('../db');

class User {
  static async create(userData) {
    const { name, email, password, role = 'user' } = userData;
    const result = await db.run(
      `INSERT INTO users (name, email, password, role, isActive, createdAt) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [name, email.toLowerCase(), password, role, true, new Date().toISOString()]
    );
    return { id: result.lastID, name, email: email.toLowerCase(), role, isActive: true };
  }

  static async findOne(query) {
    if (query.email) {
      return await db.get('SELECT * FROM users WHERE email = ?', [query.email.toLowerCase()]);
    }
    if (query.id || query._id) {
      const id = query.id || query._id;
      return await db.get('SELECT * FROM users WHERE id = ?', [id]);
    }
    return null;
  }

  static async findById(id) {
    return await db.get('SELECT * FROM users WHERE id = ?', [id]);
  }

  static async updateOne(query, update) {
    if (query.id || query._id) {
      const id = query.id || query._id;
      const setClause = Object.keys(update).map(key => `${key} = ?`).join(', ');
      const values = [...Object.values(update), id];
      return await db.run(`UPDATE users SET ${setClause} WHERE id = ?`, values);
    }
    return null;
  }

  static async findAll() {
    return await db.all('SELECT * FROM users ORDER BY createdAt DESC');
  }

  static async update(id, updateData) {
    const setClause = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(updateData), id];
    await db.run(`UPDATE users SET ${setClause} WHERE id = ?`, values);
    return await this.findById(id);
  }

  static async delete(id) {
    return await db.run('DELETE FROM users WHERE id = ?', [id]);
  }
}

module.exports = User;