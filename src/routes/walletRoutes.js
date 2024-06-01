const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController')
const authMiddleware = require('../middlewares/auth');

router.post('/wallets/expenses', authMiddleware, walletController.addExpense);
router.get('/wallets/expenses/:id', authMiddleware, walletController.getExpenseById);
router.get('/wallets/expenses', authMiddleware, walletController.getExpenseByDate);
router.get('/wallets/expenses', authMiddleware, walletController.getExpenseByMonth); 
router.put('/wallets/expenses/:id', authMiddleware, walletController.updateExpense);
router.delete('wallets/expenses/:id', authMiddleware, walletController.deleteExpense);

module.exports = router;