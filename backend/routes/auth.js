const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const authCtrl = require('../controllers/authController');

router.post('/register',
  body('name').notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min:6 }),
  authCtrl.register
);

router.post('/login',
  body('email').isEmail(),
  body('password').exists(),
  authCtrl.login
);

router.post('/refresh', authCtrl.refreshToken);
router.post('/logout', authCtrl.logout);
router.get('/me', authCtrl.protect, authCtrl.getMe);

module.exports = router;