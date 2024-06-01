const express = require('express');
const router = express.Router();
const suggestController = require('../controllers/suggestController');
const authMiddleware = require('../middlewares/auth');

router.get('/', authMiddleware, suggestController.getSuggests);

module.exports = router;