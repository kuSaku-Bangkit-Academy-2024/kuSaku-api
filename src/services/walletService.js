const { Firestore } = require('@google-cloud/firestore');
const ClientError = require('../utils/clientError');

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
    totalExpense += expenseData.price;

    // Calculate balance after the new expense is added
    let balance = walletInfo.balance || 0;

    if(totalExpense > balance){
        throw new ClientError("Expense is bigger than balance", 409);
    }

    balance -= expenseData.price; // Subtract the expense price, not the total expense


    // Update the balance and totalExpense in the wallet document
    await walletDocRef.update({ balance: balance, totalExpense: totalExpense });

    // Set the new expense data in the expenses sub-collection
    await walletDocRef.collection('expenses').doc(expenseId).set({...expenseData});
};


const getExpenseById = async (userId, walletId, expenseId) => {
    const firestore = new Firestore({
        databaseId: process.env.DATABASE
    });

    const expensesCollection = firestore.collection('users').doc(userId).collection('wallets').doc(walletId).collection('expenses');
    const doc = await expensesCollection.doc(expenseId).get();

    if (!doc.exists) {
        throw new ClientError('Expense ID is not found', 404);
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
        endOfMonth.setHours(endOfMonth.getHours() + 7);
        
        const startEpoch = Math.floor(startOfMonth.getTime() / 1000);
        const endEpoch = Math.floor(endOfMonth.getTime() / 1000);
        
        const snapshot = await expensesCollection
            .where('timestamp', '>=', startEpoch)
            .where('timestamp', '<', endEpoch)
            .get();

        const expenses = [];
        snapshot.forEach(doc => expenses.push(doc.data()));

        const totalExpenseByCategory = expenses.reduce((acc, expense) => {
            const category = expense.category;
            const price = expense.price;
            if (!acc[category]) {
                acc[category] = 0;
            }
            acc[category] += price;
            return acc;
        }, {});

        const result = Object.keys(totalExpenseByCategory).map(category => ({
            category,
            totalExpense: totalExpenseByCategory[category]
        }));

        return { expenses: result };
    } catch (error) {
        throw new Error("Unable to fetch expense by month");
    }
};

const getAllExpenseByMonth = async (userId, walletId, date) => {
    try {
        const firestore = new Firestore({
            databaseId: process.env.DATABASE
        });
        const expensesCollection = firestore.collection('users').doc(userId).collection('wallets').doc(walletId).collection('expenses');

        const startOfMonth = date;
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);
        endOfMonth.setHours(endOfMonth.getHours() + 7);
        
        const startEpoch = Math.floor(startOfMonth.getTime() / 1000);
        const endEpoch = Math.floor(endOfMonth.getTime() / 1000);
        
        const snapshot = await expensesCollection
            .where('timestamp', '>=', startEpoch)
            .where('timestamp', '<', endEpoch)
            .get();

        const expenses = [];
        snapshot.forEach(doc => expenses.push(doc.data()));

        return expenses;
    } catch (error) {
        throw new Error("Unable to fetch expense by month");
    }
};

const getExpensePerWeek = async (userId, walletId, date) => {
    const firestore = new Firestore({
        databaseId: process.env.DATABASE
    });
    const startOfMonth = date;
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    endOfMonth.setHours(endOfMonth.getHours() + 7);
    
    const expensesCollection = firestore.collection('users').doc(userId).collection('wallets').doc(walletId).collection('expenses');

    const startEpoch = Math.floor(startOfMonth.getTime() / 1000);
    const endEpoch = Math.floor(endOfMonth.getTime() / 1000);
        
    const snapshot = await expensesCollection
        .where('timestamp', '>=', startEpoch)
        .where('timestamp', '<', endEpoch)
        .get();

    const expenses = [];
    snapshot.forEach(doc => expenses.push(doc.data()));

    const weeks = [];
    date.setHours(date.getHours() - 7);
    const month = date.getMonth();
    const year = date.getFullYear();
    let startOfWeek = new Date(date);
    let endOfWeek = new Date(date);

    while (endOfWeek.getDay() !== 1) {
        endOfWeek.setDate(endOfWeek.getDate() + 1);
    }
    
    if(startOfWeek !== endOfWeek){
        weeks.push({
            startEpoch: Math.floor(startOfWeek.getTime() / 1000),
            endEpoch: Math.floor(endOfWeek.getTime() / 1000)
        });
    }

    startOfWeek.setDate(endOfWeek.getDate());

    while (startOfWeek.getMonth() == month) {
        let endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 7);

        if (endOfWeek.getMonth() > month) {
            endOfWeek = new Date(year, month + 1, 1);
        }

        weeks.push({
            startEpoch: Math.floor(startOfWeek.getTime() / 1000),
            endEpoch: Math.floor(endOfWeek.getTime() / 1000)
        });

        startOfWeek.setDate(startOfWeek.getDate() + 7);
    }

    const adjustedWeeks = weeks.map((week) => ({
        startEpoch: week.startEpoch + 25200,
        endEpoch: week.endEpoch + 25200
    }));
    
    const expensesPerWeek = [];

    adjustedWeeks.forEach((week) => {
        expensesPerWeek.push(expenses.filter((expense) => (expense.timestamp >= week.startEpoch && expense.timestamp < week.endEpoch)));
    })

    return expensesPerWeek;
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
        throw new Error('Expense ID is not found');
    }

    const oldTimestamp = expenseDoc.data().timestamp;
    const date = new Date(oldTimestamp * 1000);
    date.setHours(date.getHours() - 7);
    const year = date.getFullYear();
    const month = date.getMonth();

    const currentDate = new Date();
    currentDate.setHours(currentDate.getHours() + 7);
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    if (year !== currentYear || month !== currentMonth) {
        throw new ClientError('Expense from a past month cannot be updated.', 400);
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
        throw new ClientError('Expense ID is not found', 404);
    }
    const expenseData = expenseDoc.data();
    const oldPrice = expenseData.price;

    const dateObj = new Date(expenseData.timestamp * 1000);

    const currentDate = new Date();
    currentDate.setHours(currentDate.getHours() + 7);
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();

    if (dateObj.getFullYear() !== currentYear || dateObj.getMonth() !== currentMonth) {
        throw new ClientError('Cannot update an expense for a month other than the current month.', 400);
    }

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
    getAllExpenseByMonth,
    getExpensePerWeek,
    updateExpense,
    deleteExpense,
    getWallet
};