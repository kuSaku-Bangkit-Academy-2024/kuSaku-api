const { Firestore } = require('@google-cloud/firestore');
const { v4: uuidv4 } = require('uuid');

const addExpense = async (userId, expenseData) => {
    const firestore = new Firestore({
        databaseId: 'kusaku'
    });
    const expensesCollection = firestore.collection('users').doc(userId).collection('expenses');

    const expenseId = uuidv4();
    const expense = {
        id: expenseId,
        ...expenseData,
        timestamp: Firestore.Timestamp.now()
    };
    await expensesCollection.doc(expenseId).set(expense);
    return expense;
};

const getExpenseById = async (userId, expenseId) => {
    try {
        const firestore = new Firestore({
            databaseId: 'kusaku'
        });
        const expensesCollection = firestore.collection('users').doc(userId).collection('expenses');
        const doc = await expensesCollection.doc(expenseId).get();

        return doc.data();
    } catch (error) {
        if (!doc.exists) {
            throw new ClientError('Expense ID not found', 404);
        }
    }
};

const getExpenseByDate = async (userId, date) => {
    try {
        const firestore = new Firestore({
            databaseId: 'kusaku'
        });
        const expensesCollection = firestore.collection('users').doc(userId).collection('expenses');
       
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

const getExpenseByMonth = async (userId, month) => {
    try {
        const firestore = new Firestore({
            databaseId: 'kusaku'
        });
        const expensesCollection = firestore.collection('users').doc(userId).collection('expenses');

        const start = new Date(`${month}-01`);
        const end = new Date(start.getFullYear(), start.getMonth() + 1, 1);

        const snapshot = await expensesCollection
            .where('timestamp', '>=', admin.firestore.Timestamp.fromDate(start))
            .where('timestamp', '<', admin.firestore.Timestamp.fromDate(end))
            .get();

        if (snapshot.empty) {
            throw new NotFoundError('Data not found');
        }

        const expenses = [];
        snapshot.forEach(doc => expenses.push(doc.data()));
        return expenses;
    } catch (error) {
        throw new ClientError("Unable to fetch expense by month", 500);
    }
};

const updateExpense = async (userId, expenseId, expenseData) => {
    try {
        const firestore = new Firestore({
            databaseId: 'kusaku'
        });
        const expensesCollection = firestore.collection('users').doc(userId).collection('expenses');
        
        const expenseRef = expensesCollection.doc(expenseId);
        const doc = await expenseRef.get();
            
        await expenseRef.update(expenseData);
        const updatedDoc = await expenseRef.get();
        return updatedDoc.data();
    
    } catch (error) {
        throw { statusCode: 500, message: "Failed to update expense." };
    }
};

const deleteExpense = async (userId, expenseId) => {
    const firestore = new Firestore({
        databaseId: 'kusaku'
    });
    const expensesCollection = firestore.collection('users').doc(userId).collection('expenses');
    const expenseRef = expensesCollection.doc(expenseId);
    const doc = await expenseRef.get();
    if (!doc.exists) {
        return null;
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
};