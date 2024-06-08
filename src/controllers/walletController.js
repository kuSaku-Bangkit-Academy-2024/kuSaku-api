const responseHandler = require('../utils/responseHandler');
const walletService = require('../services/walletService');
const Expense = require('../models/expense');
const { v4: uuidv4 } = require('uuid');
const ClientError = require('../utils/clientError');

const getWallet = async (req, res) => {
    try {
        const userId = req.userId;
        const walletId = userId;

        const walletInfo = await walletService.getWallet(userId, walletId);
        responseHandler.success(res, { data: walletInfo, message: 'Wallet data retrieved successfully'});
    } catch (error) {
        responseHandler.error(res, error);
    }
};

const predictCategory = async (req, res) => {
    try {
        const { describe } = req.body;

        const category = ['Other', 'Food', 'Education',
                        'Transportation', 'Household',
                        'Social Life', 'Apparel', 'Health',
                        'Entertainment'];
        
        const randomIndex = Math.floor(Math.random() * category.length);
        const randomCategory = category[randomIndex];

        responseHandler.success(res, {
            data: {
                describe: describe,
                category: randomCategory
            }
        });
    } catch (error) {
        responseHandler.error(res, error);
    }
}

const addExpense = async (req, res) => {
    try {
        const userId = req.userId;
        const walletId = userId;
        const expenseId = uuidv4();
        let expenseData = req.body;

        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

        if (!dateRegex.test(expenseData.timestamp)) {
            throw new ClientError('Invalid date format. Use YYYY-MM-DD.', 400);
        }

        const dateParts = expenseData.timestamp.split("-");
        const year = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10) - 1; // JavaScript months are 0-11
        const day = parseInt(dateParts[2], 10) || 1;

        const dateObj = new Date(year, month, day);

        if (dateObj.getFullYear() !== year || dateObj.getMonth() !== month || dateObj.getDate() !== day) {
            throw new ClientError('Invalid date', 400);
        }

        const currentDate = new Date();
        const currentYear = currentDate.getFullYear();
        const currentMonth = currentDate.getMonth();

        if (year !== currentYear || month !== currentMonth) {
            throw new ClientError('Cannot add an expense for a month other than the current month.', 400);
        }

        expenseData.timestamp = Math.floor(dateObj.getTime() / 1000);

        const expense = new Expense({
            expenseId: expenseId,
            describe: expenseData.describe,
            price: expenseData.price,
            timestamp: expenseData.timestamp,
            category: expenseData.category
        });

        expense.validate();

        await walletService.addExpense(userId, walletId, expenseId, expense.toFirestore());
        responseHandler.success(res, {
            data: expense.toInterface(),
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
        const expenses = new Expense(expense);

        responseHandler.success(res, {data: expenses.toInterface()});
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

        const dateParts = date.split("-");
        const year = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10) - 1;
        const day = parseInt(dateParts[2], 10) || 1;
        const dateObj = new Date(year, month, day);

        if (dateObj.getFullYear() !== year || dateObj.getMonth() !== month || dateObj.getDate() !== day){
            throw new ClientError('Invalid date', 400);
        }
        if (dateRegex.test(date)) {
            expenses = await walletService.getExpenseByDate(userId, walletId, dateObj);
            const expensesObj = expenses.map(expense => new Expense(expense));
            const expensesClean = expensesObj.map(expense => expense.toInterface());

            responseHandler.success(res, {
                data : {
                    expenses: expensesClean
                }, message: 'Expenses retrieved successfully by date'
             },
            );
        } else if (monthRegex.test(date)) {
            expenses = await walletService.getExpenseByMonth(userId, walletId, dateObj);

            responseHandler.success(res, {
                data: expenses, message: 'Expenses retrieved successfully by month'
             },
            );
        } else {
            throw new ClientError('Invalid date format. Use YYYY-MM-DD or YYYY-MM.', 400);
        }
    } catch (error) {
        responseHandler.error(res, error);
    }
};

const getExpensePerWeek = async (req, res) => {
    try {
        const userId = req.userId;
        const walletId = userId;
        const { date } = req.query;

        const monthRegex = /^\d{4}-\d{2}$/;     // YYYY-MM

        if (!monthRegex.test(date)) {
            throw new ClientError('Invalid date format. Use YYYY-MM.', 400);
        }

        const dateParts = date.split("-");
        const year = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10) - 1;
        const day = 1;
        const dateObj = new Date(year, month, day);

        if (dateObj.getFullYear() !== year || dateObj.getMonth() !== month || dateObj.getDate() !== day){
            throw new ClientError('Invalid date', 400);
        }

        const monthlyExpenses = await walletService.getExpensePerWeek(userId, walletId, dateObj);
        const expenses = {}
        monthlyExpenses.forEach((weeklyExpenses, idx) => {
            const expensesObj = weeklyExpenses.map(expense => new Expense(expense));
            const expensesClean = expensesObj.map(expense => expense.toInterface());
            expenses[`week ${idx+1}`] = expensesClean;
        })

        responseHandler.success(res, {data: expenses});
    } catch (error) {
        responseHandler.error(res, error);
    }
}

const updateExpense = async (req, res) => {
    try {
        const userId = req.userId;
        const walletId = userId;
        const expenseId = req.params.id;
        const expenseData = req.body;

        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

        if (!dateRegex.test(expenseData.timestamp)) {
            throw new ClientError('Invalid date format. Use YYYY-MM-DD or YYYY-MM.', 400);
        }

        const dateParts = expenseData.timestamp.split("-");
        const year = parseInt(dateParts[0], 10);
        const month = parseInt(dateParts[1], 10) - 1;
        const day = parseInt(dateParts[2], 10) || 1;
        const dateObj = new Date(year, month, day);

        if (dateObj.getFullYear() !== year || dateObj.getMonth() !== month || dateObj.getDate() !== day){
            throw new ClientError('Invalid date', 400);
        }

        expenseData.timestamp = Math.floor(dateObj.getTime() / 1000);

        const expense = new Expense({expenseId: expenseId, ...expenseData});
        expense.validate();

        await walletService.updateExpense(userId, walletId, expenseId, expense.toFirestore());
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
    predictCategory,
    getExpenseById,
    getExpenseByDate,
    getExpensePerWeek,
    updateExpense,
    deleteExpense,
    getWallet
};