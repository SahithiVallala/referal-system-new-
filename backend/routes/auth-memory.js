const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const authCtrl = require('../controllers/authController-memory');

router.post('/register',
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min:6 }).withMessage('Password must be at least 6 characters'),
  authCtrl.register
);

router.post('/login',
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').exists().withMessage('Password is required'),
  authCtrl.login
);

router.post('/refresh', authCtrl.refreshToken);
router.post('/logout', authCtrl.logout);
router.get('/me', authCtrl.protect, authCtrl.getMe);

module.exports = router;