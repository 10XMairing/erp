const express = require('express');

const admin = require('../controllers/admin');
const { check, body } = require('express-validator/check');

const router = express.Router();

router.get('/register', admin.getRegister);
router.post('/register',admin.postRegister);
router.get('/register/:token', admin.getNewPassword);
router.post('/new-password', admin.postNewPassword);

router.get('/login', admin.getLogin);

router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email address.')
      .normalizeEmail(),
    body('password', 'Password has to be of min 5 letter and alphanumeric')
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim()
  ],
  admin.postLogin
);

router.post('/logout', admin.postLogout);

module.exports = router;
