const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController')
const authMiddleware = require('../middlewares/auth');

router.post('/expenses', authMiddleware, walletController.addExpense);
router.get('/expenses/:id', authMiddleware, walletController.getExpenseById);
router.get('/expenses', authMiddleware, walletController.getExpenseByDate);
router.get('/expenses', authMiddleware, walletController.getExpenseByMonth); 
router.put('/expenses/:id', authMiddleware, walletController.updateExpense);
router.delete('/expenses/:id', authMiddleware, walletController.deleteExpense);

module.exports = router;