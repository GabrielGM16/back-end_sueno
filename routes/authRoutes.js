const express = require('express');
const { register, verifyAccount, login } = require('../controllers/authController');
const router = express.Router();

router.post('/register', register);
router.post('/verify', verifyAccount);
router.post('/login', login);

module.exports = router;
