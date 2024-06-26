const { Firestore } = require('@google-cloud/firestore');
const ClientError = require('../utils/clientError');

const register = async (data) => {
  const db = new Firestore({
    databaseId: process.env.DATABASE
  });
  const userCollection = db.collection('users');
  await userCollection.doc(data.id).set(data);

  const walletCollection = db.collection('users').doc(data.id).collection('wallets');
  await walletCollection.doc(data.id).set({ totalExpense: 0, income: data.income, balance: data.income });
};

const getUserById = async (userId) => {
  const db = new Firestore({
    databaseId: process.env.DATABASE
  });
  const userById = await db.collection('users').doc(userId).get();

  if (!userById.exists){
    throw new ClientError('User not found', 400);
  }
  return userById.data();
};

const getUserByEmail = async (email) => {
  const db = new Firestore({
    databaseId: process.env.DATABASE
  });
  const userByEmail = await db.collection('users').where('email', '==', email).get();
  
  const data = [];
  userByEmail.forEach(doc => {
      data.push(doc.data());
  });

  return data;
}

const updateUser = async (userId, data) => {
  const db = new Firestore({
    databaseId: process.env.DATABASE
  });
  
  const userTarget = db.collection('users').doc(userId);
  const walletTarget = userTarget.collection('wallets').doc(userId);
  const walletData = await walletTarget.get();
  const totalExpense = walletData.data().totalExpense;

  if(data.income){
    if(data.income < totalExpense){
      throw new ClientError("Expenses are bigger than income", 400);
    } else {
      await walletTarget.update({income: data.income, balance: (data.income-totalExpense)})
    }
  }

  await userTarget.update(data);
};

module.exports = {
  register,
  getUserById,
  getUserByEmail,
  updateUser
}