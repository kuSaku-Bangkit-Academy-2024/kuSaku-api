const { Firestore } = require('@google-cloud/firestore');
const ClientError = require('../utils/clientError');
const Expense = require('../models/expense');

const getWallet = async (userId, walletId) => {
    try {
        const firestore = new Firestore({
            databaseId: process.env.DATABASE
        });
        const walletCollection = await firestore.collection('users').doc(userId).collection('wallets').doc(walletId).get();
        const walletSnapshot = walletCollection.data();
        
        return walletSnapshot;
    } catch (error) {
        throw new ClientError('Error retrieving wallet data', 500);
    }
};

const addExpense = async (userId, walletId, expenseId, expenseData) => {
    const firestore = new Firestore({
        databaseId: process.env.DATABASE
    });
    const walletDocRef = firestore.collection('users').doc(userId).collection('wallets').doc(walletId);
    const walletDoc = await walletDocRef.get(); // Get the document snapshot
    const walletInfo = walletDoc.data();

    if (!walletInfo) {
        throw new Error('Wallet not found');
    }

    // Calculate totalExpense after the new expense is added
    let totalExpense = walletInfo.totalExpense || 0;
    console.log(totalExpense);
    totalExpense += expenseData.price;
    console.log(totalExpense);

    // Calculate balance after the new expense is added
    let balance = walletInfo.balance || 0;
    console.log(balance);
    balance -= expenseData.price; // Subtract the expense price, not the total expense
    console.log(balance);

    // Update the balance and totalExpense in the wallet document
    await walletDocRef.update({ balance: balance, totalExpense: totalExpense });

    // Set the new expense data in the expenses sub-collection
    await walletDocRef.collection('expenses').doc(expenseId).set({ expenseId: expenseId, ...expenseData});
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

    const expense = doc.data();
    expense.id = doc.id;
    return expense;
};

const getExpenseByDate = async (userId, walletId, date) => {
    try {
        const firestore = new Firestore({
            databaseId: process.env.DATABASE
        });

        const dateEpoch = Math.floor(date.getTime() / 1000);
        const expensesCollection = firestore.collection('users').doc(userId).collection('wallets').doc(walletId).collection('expenses');

        const snapshot = await expensesCollection.where('timestamp', '==', dateEpoch).get(); 
        
        const expenses = [];
        snapshot.forEach(doc => {
            expenses.push(doc.data());
        });

        return expenses;
    } catch (error) {
        console.error(error);
        throw new ClientError("Unable to fetch expenses by date", 500);
    }
};


const getExpenseByMonth = async (userId, walletId, date) => {
    try {
        const firestore = new Firestore({
            databaseId: process.env.DATABASE
        });
        const expensesCollection = firestore.collection('users').doc(userId).collection('wallets').doc(walletId).collection('expenses');

        const startOfMonth = date;
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);
        
        const startEpoch = Math.floor(startOfMonth.getTime() / 1000);
        const endEpoch = Math.floor(endOfMonth.getTime() / 1000);
        console.log(startEpoch, endEpoch);
        
        const snapshot = await expensesCollection
            .where('timestamp', '>=', startEpoch)
            .where('timestamp', '<', endEpoch)
            .get();

        const expenses = [];
        snapshot.forEach(doc => expenses.push(doc.data()));
        console.log(expenses);

        const totalExpenseByCategory = expenses.reduce((acc, expense) => {
            const category = expense.category;
            const amount = expense.amount; // Assuming 'amount' is the field name for expense amount
            if (!acc[category]) {
                acc[category] = 0;
            }
            acc[category] += amount;
            return acc;
        }, {});

        console.log(totalExpenseByCategory);

        const result = Object.keys(totalExpenseByCategory).map(category => ({
            category,
            totalExpense: totalExpenseByCategory[category]
        }));

        console.log(result);

        return { expenses: result };
    } catch (error) {
        throw new Error("Unable to fetch expense by month");
    }
};

const updateExpense = async (userId, walletId, expenseId, expenseData) => {
    const firestore = new Firestore({
        databaseId: process.env.DATABASE
    });
    const walletDocRef = firestore.collection('users').doc(userId).collection('wallets').doc(walletId);
    const expenseRef = walletDocRef.collection('expenses').doc(expenseId);

    // Get the expense document snapshot
    const expenseDoc = await expenseRef.get();
    if (!expenseDoc.exists) {
        throw new Error('Expense not found');
    }
    const oldPrice = expenseDoc.data().price;
    const newPrice = expenseData.price;

    // Get the wallet document snapshot
    const walletDoc = await walletDocRef.get();
    if (!walletDoc.exists) {
        throw new Error('Wallet not found');
    }
    const walletData = walletDoc.data();
    let balance = walletData.balance;
    let totalExpense = walletData.totalExpense;

    let newExpense;
    if (newPrice > oldPrice) {
        newExpense = newPrice - oldPrice;
        totalExpense += newExpense;
        balance -= newExpense;
    } else if (newPrice < oldPrice) {
        newExpense = oldPrice - newPrice;
        balance += newExpense;
        totalExpense -= newExpense;
    }

    if (balance < 0) {
        throw new ClientError("Balance tidak mencukupi", 409);
    }

    // Update balance and totalExpense in the wallet document
    await walletDocRef.update({ balance: balance, totalExpense: totalExpense });

    // Update the expense document with the new data
    await expenseRef.update({ describe: expenseData.describe, price: expenseData.price, timestamp: expenseData.timestamp});

    const updatedDoc = await expenseRef.get();
    return updatedDoc.data();
};


const deleteExpense = async (userId, walletId, expenseId) => {
    const firestore = new Firestore({
        databaseId: process.env.DATABASE
    });

    const walletDocRef = firestore.collection('users').doc(userId).collection('wallets').doc(walletId);
    const expenseRef = walletDocRef.collection('expenses').doc(expenseId);

    // Get the expense document snapshot
    const expenseDoc = await expenseRef.get();
    if (!expenseDoc.exists) {
        throw new ClientError('Data not found', 404);
    }
    const oldPrice = expenseDoc.data().price;

    // Get the wallet document snapshot
    const walletDoc = await walletDocRef.get();
    if (!walletDoc.exists) {
        throw new Error('Wallet not found');
    }
    const walletData = walletDoc.data();
    let balance = walletData.balance;
    let totalExpense = walletData.totalExpense;

    // Update totalExpense and balance
    totalExpense -= oldPrice;
    balance += oldPrice;

    // Update the wallet document with the new balance and totalExpense
    await walletDocRef.update({ balance: balance, totalExpense: totalExpense });

    // Delete the expense document
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