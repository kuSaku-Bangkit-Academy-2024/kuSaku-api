const responseHandler = require('../utils/responseHandler');
const walletService = require('../services/walletService');
const Expense = require('../models/expense');
const { v4: uuidv4 } = require('uuid');

const addExpense = async (req, res) => {
    try {
        const userId = req.userId;
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
        const { date } = req.query.date; // YYYY-MM-DD
        const expenses = await walletService.getExpenseByDate(userId, date);
        responseHandler.success(res, {data: expenses, message: 'Expenses retrieved successfully by date'});
    } catch (error) {
        responseHandler.error(res, error);
    }
};

const getExpenseByMonth = async (req, res) => {
    try {
        const userId = req.userId; // Mengambil userId dari request
        const { month } = req.query; // Mengambil month dari query
        const expenses = await walletService.getExpenseByMonth(userId, month); // YYYY-MM
        responseHandler.success(res, {data: expenses, message: 'Expenses retrieved successfully by month'});
    } catch (error) {
        responseHandler.error(res, error);
    }
};

const updateExpense = async (req, res) => {
    try {
        const userId = req.userId;
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
    getExpenseByMonth,
    updateExpense,
    deleteExpense
};