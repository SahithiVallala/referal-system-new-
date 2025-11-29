const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/authController-memory');
const { role } = require('../middleware/roleMiddleware');
const bcrypt = require('bcrypt');

// Helper functions
const findUserByEmail = (users, email) => users.find(u => u.email === email);
const findUserById = (users, id) => users.find(u => u._id === id);

router.use(authCtrl.protect);

router.get('/users', role(['admin','superadmin']), async (req,res,next)=>{
  try {
    const users = req.app.locals.users;
    const usersWithoutPasswords = users.map(({ password, ...user }) => user);
    res.json({ users: usersWithoutPasswords });
  } catch (err){ next(err); }
});

router.post('/create-user', role('superadmin'), async (req,res,next)=>{
  try {
    const { name, email, password, role: newRole } = req.body;
    const users = req.app.locals.users;
    
    // Check if user already exists
    if (findUserByEmail(users, email)) {
      return res.status(400).json({ message: 'Email already exists' });
    }
    
    const hashed = await bcrypt.hash(password, 10);
    const newUser = {
      _id: String(Date.now()),
      name,
      email,
      password: hashed,
      role: newRole || 'user',
      isActive: true,
      createdAt: new Date()
    };
    
    users.push(newUser);
    res.status(201).json({ 
      message:'User created successfully', 
      user:{ 
        id: newUser._id, 
        name: newUser.name,
        email: newUser.email, 
        role: newUser.role 
      }
    });
  } catch (err){ next(err); }
});

router.patch('/users/:id/role', role('superadmin'), async (req,res,next)=>{
  try {
    const { role: newRole } = req.body;
    const users = req.app.locals.users;
    const user = findUserById(users, req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    user.role = newRole;
    const { password, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  } catch (err){ next(err); }
});

router.delete('/users/:id', role('superadmin'), async (req,res,next)=>{
  try {
    const users = req.app.locals.users;
    const userIndex = users.findIndex(u => u._id === req.params.id);
    
    if (userIndex === -1) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Don't allow deleting yourself
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }
    
    users.splice(userIndex, 1);
    res.json({ message: 'User deleted successfully' });
  } catch (err){ next(err); }
});

router.patch('/users/:id/status', role(['admin', 'superadmin']), async (req,res,next)=>{
  try {
    const { isActive } = req.body;
    const users = req.app.locals.users;
    const user = findUserById(users, req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Don't allow deactivating yourself
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: 'Cannot change your own status' });
    }
    
    user.isActive = isActive;
    const { password, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  } catch (err){ next(err); }
});

module.exports = router;