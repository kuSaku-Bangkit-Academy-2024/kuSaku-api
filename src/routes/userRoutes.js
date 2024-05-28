const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/auth');

router.post('/register', userController.register);
router.get('/profile', authMiddleware, userController.getUser);
router.put('/profile', authMiddleware, userController.updateUser);

module.exports = router;