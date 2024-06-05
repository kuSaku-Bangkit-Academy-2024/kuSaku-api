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

const addExpense = async (userId, walletId, expenseId, expenseData, category) => {
    const firestore = new Firestore({
        databaseId: process.env.DATABASE
    });
    const expensesCollection = firestore.collection('users').doc(userId).collection('wallets').doc(walletId).collection('expenses');

    // tambahin jumlah totalExpense dan kurangin balance sesuai price

    await expensesCollection.doc(expenseId).set({expenseId: expenseId, ...expenseData});
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
        const expensesCollection = firestore.collection('users').doc(userId).collection('wallets').doc(walletId).collection('expenses');

        const snapshot = await expensesCollection.where('timestamp', '==', date).get(); 
        
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


const getExpenseByMonth = async (userId, walletId, month) => {
    try {
        const firestore = new Firestore({
            databaseId: process.env.DATABASE
        });
        const expensesCollection = firestore.collection('users').doc(userId).collection('wallets').doc(walletId).collection('expenses');

        // keknya harus ubah timestamp ke bentuk Unix Epoch :(
        const snapshot = await expensesCollection
            .where('timestamp', '>=', admin.firestore.Timestamp.fromDate(start))
            .where('timestamp', '<', admin.firestore.Timestamp.fromDate(end))
            .get();

        if (snapshot.empty) {
            throw new ClientError('Data not found', 404);
        }

        const expenses = [];
        snapshot.forEach(doc => expenses.push(doc.data()));

        const totalExpenseByCategory = expenses.reduce((acc, expense) => {
            const category = expense.category;
            const amount = expense.amount; // Assuming 'amount' is the field name for expense amount
            if (!acc[category]) {
                acc[category] = 0;
            }
            acc[category] += amount;
            return acc;
        }, {});

        const result = Object.keys(totalExpenseByCategory).map(category => ({
            category,
            totalExpense: totalExpenseByCategory[category]
        }));

        return { expenses: result };
    } catch (error) {
        throw new ClientError("Unable to fetch expense by month", 500);
    }
};

const updateExpense = async (userId, walletId, expenseId, expenseData) => {
    const firestore = new Firestore({
        databaseId: process.env.DATABASE
    });
    const expensesCollection = firestore.collection('users').doc(userId).collection('wallets').doc(walletId).collection('expenses');
    
    const expenseRef = expensesCollection.doc(expenseId);
    /* 
    agak ribet ini

    cek dlu apakah perubahan price akan mencukupi ama balancenya
    perubahan price ngubah totalExpense ama balance
        -> price bertambah: totalExpense naik, balance turun berdasarkan selisih price sebelum dan sesudah edit
        -> price berkurang: totalExpense turun, balance naik berdasarkan selisih price sebelum dan sesudah edit 
        (keknya bisa diakalin biar ga percabangan, soalnya selisih price bisa negatif dan positif)
    */
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

    // kurangi totalExpense ama naikin balance

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