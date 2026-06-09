const { Router }            = require('express');
const { login, logout, me } = require('../controllers/auth.controllers');
const { authenticateToken } = require('../middlewares/authenticateToken');

const router = Router();

router.post('/login',  login);
router.post('/logout', logout);
router.get('/me',      authenticateToken, me);

module.exports = router;
