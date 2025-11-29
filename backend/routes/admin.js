const express = require('express');
const router = express.Router();
const authCtrl = require('../controllers/authController');
const User = require('../models/User');
const { role } = require('../middleware/roleMiddleware');

router.use(authCtrl.protect);
router.get('/users', role(['admin','superadmin']), async (req,res,next)=>{
  try {
    const users = await User.find().select('-password');
    res.json({ users });
  } catch (err){ next(err); }
});

router.post('/create-user', role('superadmin'), async (req,res,next)=>{
  try {
    const { name, email, password, role: newRole } = req.body;
    const hashed = await require('bcrypt').hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role: newRole || 'user' });
    res.status(201).json({ message:'created', user:{ id:user._id, email:user.email, role:user.role }});
  } catch (err){ next(err); }
});

router.patch('/users/:id/role', role('superadmin'), async (req,res,next)=>{
  try {
    const { role: newRole } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role: newRole }, { new:true }).select('-password');
    res.json({ user });
  } catch (err){ next(err); }
});

router.patch('/users/:id/status', role(['admin','superadmin']), async (req,res,next)=>{
  try {
    const { isActive } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { isActive }, { new:true }).select('-password');
    res.json({ user });
  } catch (err){ next(err); }
});

router.delete('/users/:id', role('superadmin'), async (req,res,next)=>{
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted successfully' });
  } catch (err){ next(err); }
});

module.exports = router;