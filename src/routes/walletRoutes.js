const express = require('express');
const router = express.Router();
const walletController = require('../controllers/walletController')
const authMiddleware = require('../middlewares/auth');

router.get('/', authMiddleware, walletController.getWallet);
router.post('/expenses', authMiddleware, walletController.addExpense);
router.post('/expenses/predict-category', authMiddleware, walletController.predictCategory); 
router.get('/expenses/month', authMiddleware, walletController.getAllExpenseByMonth); 
router.get('/expenses/weekly', authMiddleware, walletController.getExpensePerWeek);
router.get('/expenses/:id', authMiddleware, walletController.getExpenseById);
router.get('/expenses', authMiddleware, walletController.getExpenseByDate); 
router.put('/expenses/:id', authMiddleware, walletController.updateExpense);
router.delete('/expenses/:id', authMiddleware, walletController.deleteExpense);

module.exports = router;