const express = require('express');
const { login, me } = require('../controllers/auth.controller');
const { verifyToken } = require('../lib/auth');

const router = express.Router();

router.post('/login', login);
router.get('/me', verifyToken, me);

module.exports = router;
