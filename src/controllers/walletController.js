const responseHandler = require('../utils/responseHandler');
const walletService = require('../services/walletService');
const Expense = require('../models/expense');
const { v4: uuidv4 } = require('uuid');

const getWallet = async (req, res) => {
    try {
        const userId = req.userId;
        const walletId = userId;

        const { totalExpense, salary, balance } = await walletService.getWallet(userId, walletId);

        responseHandler.success(res, {
            data: {
                totalExpense: totalExpense,
                salary: salary,
                balance: balance
            },
            message: 'Wallet data retrieved successfully'
        });
    } catch (error) {
        responseHandler.error(res, error);
    }
};

const addExpense = async (req, res) => {
    try {
        const userId = req.userId;
        const walletId = userId;
        const expenseId = uuidv4();
        let expenseData = req.body;
        const category = "dummy"; // nanti pake ML

        const expense = new Expense({id: expenseId, category, ...expenseData});
        expense.validate();

        await walletService.addExpense(userId, expense.toFirestore());
        responseHandler.success(res, {message: "success adding the expense"});
    } catch (error) {
        responseHandler.error(res, error);
    }
};

const getExpenseById = async (req, res) => {
    try {
        const userId = req.userId;
        const walletId = userId;
        const expenseId = req.params.id;

        const expense = await walletService.getExpenseById(userId, expenseId);
        responseHandler.success(res, {data: expense});
    } catch (error) {
        responseHandler.error(res, error);
    }
};

const getExpenseByDate = async (req, res) => {
    try {
        const userId = req.userId;
        const walletId = userId;
        const { date } = req.query;

        const dateRegex = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD
        const monthRegex = /^\d{4}-\d{2}$/;     // YYYY-MM

        let expenses;
        if (dateRegex.test(date)) {
            expenses = await walletService.getExpenseByDate(userId, date);
            responseHandler.success(res, {data: expenses, message: 'Expenses retrieved successfully by date'});
        } else if (monthRegex.test(date)) {
            expenses = await walletService.getExpenseByMonth(userId, date);
            responseHandler.success(res, {data: expenses, message: 'Expenses retrieved successfully by month'});
        } else {
            throw new ClientError('Invalid date format. Use YYYY-MM-DD or YYYY-MM.', 400);
        }
    } catch (error) {
        responseHandler.error(res, error);
    }
};

const updateExpense = async (req, res) => {
    try {
        const userId = req.userId;
        const walletId = userId;
        const expenseId = req.params.id;
        const expenseData = req.body;
        const category = "dummy"; // nanti pake ML
        const expense = new Expense({id: expenseId, ...expenseData, category});
        expense.validate();

        await walletService.updateExpense(userId, expense.toFirestore());
        responseHandler.success(res, {message: "success updating the expense"});
    } catch (error) {
        responseHandler.error(res, error);
    }
};

const deleteExpense = async (req, res) => {
    try {
        const userId = req.userId;
        const walletId = userId;
        const expenseId = req.params.id;

        await walletService.deleteExpense(userId, expenseId);
        responseHandler.success(res, {message: 'expense deleted successfully'});
    } catch (error) {
        responseHandler.error(res, error);
    }
};

module.exports = {
    addExpense,
    getExpenseById,
    getExpenseByDate,
    updateExpense,
    deleteExpense,
    getWallet
};