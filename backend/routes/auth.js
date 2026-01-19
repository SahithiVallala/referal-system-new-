const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const authCtrl = require('../controllers/authController');
const { validateAzureToken } = require('../middleware/azureAuthMiddleware');

// Local authentication routes
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

// Protected route - works with both local and Azure AD tokens
router.get('/me', authCtrl.protect, authCtrl.getMe);

// Azure AD specific route - validates Azure AD token and returns user info
router.get('/azure/me', validateAzureToken, authCtrl.azureLogin);

module.exports = router;
