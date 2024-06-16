const express = require('express');
const router = express.Router();
const adviceController = require('../controllers/adviceController');
const authMiddleware = require('../middlewares/auth');

router.get('/', authMiddleware, adviceController.getAdvices);
router.get('/addDummy', adviceController.add);

module.exports = router;