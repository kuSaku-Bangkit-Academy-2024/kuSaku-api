const { Firestore } = require('@google-cloud/firestore');
const ClientError = require('../utils/clientError');
const Expense = require('../models/expense');

const getWallet = async (userId, walletId) => {
    try {
        const firestore = new Firestore({
            databaseId: process.env.DATABASE
        });
        const expensesCollection = firestore.collection('users').doc(userId).collection('wallets').doc(walletId).collection('expenses');
        const expensesSnapshot = await expensesCollection.get();

        let totalExpense = 0;

        expensesSnapshot.forEach(doc => {
            const expenseData = doc.data();
            totalExpense += expenseData.amount;
        });

        const walletDoc = await firestore.collection('users').doc(userId).collection('wallets').doc(walletId).get();
        const walletData = walletDoc.data();
        const salary = walletData.salary;

        const balance = salary - totalExpense;

        return { totalExpense, salary, balance };
    } catch (error) {
        throw new ClientError('Error retrieving wallet data', 500);
    }
};

const addExpense = async (userId, walletId, expenseData) => {
    const firestore = new Firestore({
        databaseId: process.env.DATABASE
    });
    const expensesCollection = firestore.collection('users').doc(userId).collection('wallets').doc(walletId).collection('expenses');

    await expensesCollection.doc(expenseData.id).set(expenseData);
};

const getExpenseById = async (userId, walletId, expenseId) => {
    const firestore = new Firestore({
        databaseId: process.env.DATABASE
    });

    const expensesCollection = firestore.collection('users').doc(userId).collection('wallets').doc(walletId).collection('expenses');
    const doc = await expensesCollection.doc(expenseId).get();

    if (!doc.exists) {
        throw new ClientError('Expense ID not found', 404);
    }

    const expense = new Expense({...doc.data()});

    return expense.toInterface();
};

const getExpenseByDate = async (userId, walletId, date) => {
    try {
        const firestore = new Firestore({
            databaseId: process.env.DATABASE
        });
        const expensesCollection = firestore.collection('users').doc(userId).collection('wallets').doc(walletId).collection('expenses');
       
        const start = new Date(date);
        const end = new Date(start);
        end.setDate(start.getDate() + 1);

        const snapshot = await expensesCollection
            .where('timestamp', '>=', Firestore.Timestamp.fromDate(start))
            .where('timestamp', '<', Firestore.Timestamp.fromDate(end))
            .get();

        const expenses = [];
        snapshot.forEach(doc => expenses.push(doc.data()));
        return expenses;
    } catch (error) {
        throw new ClientError("Unable to fetch expenses by date", 500);
    }
};

const getExpenseByMonth = async (userId, walletId, month) => {
    try {
        const firestore = new Firestore({
            databaseId: process.env.DATABASE
        });
        const expensesCollection = firestore.collection('users').doc(userId).collection('wallets').doc(walletId).collection('expenses');

        const start = new Date(`${month}-01`);
        const end = new Date(start.getFullYear(), start.getMonth() + 1, 1);

        const snapshot = await expensesCollection
            .where('timestamp', '>=', admin.firestore.Timestamp.fromDate(start))
            .where('timestamp', '<', admin.firestore.Timestamp.fromDate(end))
            .get();

        if (snapshot.empty) {
            throw new ClientError('Data not found', 404);
        }

        const expenses = [];
        snapshot.forEach(doc => expenses.push(doc.data()));
        return expenses;
    } catch (error) {
        throw new ClientError("Unable to fetch expense by month", 500);
    }
};

const updateExpense = async (userId, walletId, expenseData) => {
    const firestore = new Firestore({
        databaseId: process.env.DATABASE
    });
    const expensesCollection = firestore.collection('users').doc(userId).collection('wallets').doc(walletId).collection('expenses');
    
    const expenseRef = expensesCollection.doc(expenseData.id);

    await expenseRef.update(expenseData);
    const updatedDoc = await expenseRef.get();

    return updatedDoc.data();
};

const deleteExpense = async (userId, walletId, expenseId) => {
    const firestore = new Firestore({
        databaseId: process.env.DATABASE
    });

    const expensesCollection = firestore.collection('users').doc(userId).collection('wallets').doc(walletId).collection('expenses');
    const expenseRef = expensesCollection.doc(expenseId);
    const doc = await expenseRef.get();

    if (!doc.exists) {
        throw new ClientError('Data not found', 404);
    }

    await expenseRef.delete();
};

module.exports = {
    addExpense,
    getExpenseById,
    getExpenseByDate,
    getExpenseByMonth,
    updateExpense,
    deleteExpense,
    getWallet
};