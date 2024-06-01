const responseHandler = require('../utils/responseHandler');
const walletService = require('../services/walletService');
const Expense = require('../models/wallet');

const addExpense = async (req, res) => {
    try {
        const userId = req.userId;
        const expenseData = req.body;
        const Expense = new Expense(...expenseData);
        Expense.validate();
        const newExpense = await walletService.addExpense(userId, expenseData);
        responseHandler.success(res, newExpense, "Success adding the expense");
    } catch (error) {
        responseHandler.error(res, error);
    }
};

const getExpenseById = async (req, res) => {
    try {
        const userId = req.userId;
        const expenseId = req.params.id;
        const expense = await walletService.getExpenseById(userId, expenseId);
        responseHandler.success(res, expense);
    } catch (error) {
        responseHandler.error(res, error);
    }
};

const getExpenseByDate = async (req, res) => {
    try {
        const userId = req.userId;
        const { date } = req.query.date; // YYYY-MM-DD
        const expenses = await walletService.getExpenseByDate(userId, date);
        responseHandler.success(res, expenses, 'Expenses retrieved successfully by date');
    } catch (error) {
        responseHandler.error(res, error);
    }
};

const getExpenseByMonth = async (req, res) => {
    try {
        const userId = req.userId; // Mengambil userId dari request
        const { month } = req.query; // Mengambil month dari query
        const expenses = await walletService.getExpenseByMonth(userId, month); // YYYY-MM
        responseHandler.success(res, expenses, 'Expenses retrieved successfully by month');
    } catch (error) {
        responseHandler.error(res, error);
    }
};

const updateExpense = async (req, res) => {
    try {
        const userId = req.userId;
        const expenseId = req.params.id;
        const expenseData = req.body;
        const Expense = new Expense({...expenseData});
        Expense.validate();

        expenseData = Expense.toFirestore();
        const updatedExpense = await walletService.updateExpense(userId, expenseId, expenseData);
        responseHandler.success(res, updatedExpense);
    } catch (error) {
        responseHandler.error(res, error);
    }
};

const deleteExpense = async (req, res) => {
    try {
        const userId = req.userId;
        const expenseId = req.params.id;
        await walletService.deleteExpense(userId, expenseId);
        responseHandler.success(res, { message: 'Expense deleted successfully' });
    } catch (error) {
        responseHandler.error(res, {message: 'Expense not found'});
    }
};

module.exports = {
    addExpense,
    getExpenseById,
    getExpenseByDate,
    getExpenseByMonth,
    updateExpense,
    deleteExpense,
};