const responseHandler = require('../utils/responseHandler');
const walletService = require('../services/walletService');
const Expense = require('../models/expense');
const { v4: uuidv4 } = require('uuid');

const getWallet = async (req, res) => {
    try {
        const userId = req.userId;
        const walletId = userId;

        const walletInfo = await walletService.getWallet(userId, walletId);
        console.log(walletInfo)
        responseHandler.success(res, {
            data: {
                income: walletInfo.income,
                balance: walletInfo.balance,
                totalExpense: walletInfo.totalExpense
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

        await walletService.addExpense(userId, walletId, expenseId, expenseData);
        responseHandler.success(res, {
            data: {
                "id": expenseId,
                "timestamp": expenseData.timestamp,
                "describe": expenseData.describe,
                "price": expenseData.price,
                "category": expenseData.category
            },
            message: "success adding the expense"
        }, 201);
    } catch (error) {
        responseHandler.error(res, error);
    }
};

const getExpenseById = async (req, res) => {
    try {
        const userId = req.userId;
        const walletId = userId;
        const expenseId = req.params.id;

        const expense = await walletService.getExpenseById(userId, walletId, expenseId);
        responseHandler.success(res, {data: {
                "id": expense.expenseId,
                "timestamp": expense.timestamp,
                "describe": expense.describe,
                "price": expense.price,
                "category": expense.category
            }
        });
    } catch (error) {
        responseHandler.error(res, error);
    }
};

const getExpenseByDate = async (req, res) => {
    try {
        const userId = req.userId;
        const walletId = userId;
        const { date } = req.query;
        console.log(date);
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD
        const monthRegex = /^\d{4}-\d{2}$/;     // YYYY-MM

        let expenses;
        if (dateRegex.test(date)) {
            expenses = await walletService.getExpenseByDate(userId, walletId, date);
            console.log(expenses);
            const formattedExpenses = expenses.map(expense => ({
                id: expense.expenseId,
                timestamp: expense.timestamp, // Convert Firestore timestamp to ISO string
                describe: expense.describe,
                price: expense.price,
                category: expense.category
            }));
            console.log(formattedExpenses);
            responseHandler.success(res, {data: {
                expenses: formattedExpenses
            }, message: 'Expenses retrieved successfully by date'});
        } else if (monthRegex.test(date)) {
            expenses = await walletService.getExpenseByMonth(userId, walletId, date, category);
            responseHandler.success(res, {data: 
                expenses, 
                message: 'Expenses retrieved successfully by month'
            });
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
        // const category = "dummy"; // nanti pake ML // Kategori ga bisa diupdate
        // const expense = new Expense({id: expenseId, ...expenseData, category});
        // expense.validate();

        await walletService.updateExpense(userId, walletId, expenseId, expenseData);
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

        await walletService.deleteExpense(userId, walletId, expenseId);
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