const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const authController = require('../controllers/authController');

router.post('/login', authController.login);
router.post('/token', authController.token);
router.post('/change-password', authController.sendLink);
router.delete('/logout', authMiddleware, authController.logout);

module.exports = router;