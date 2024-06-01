const { Firestore } = require('@google-cloud/firestore');
const ClientError = require('../utils/clientError');

const register = async (data) => {
  const db = new Firestore({
    databaseId: process.env.DATABASE
  });
  const userCollection = db.collection('users');
  
  return await userCollection.doc(data.id).set(data);
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
  await userTarget.update(data);
};

module.exports = {
  register,
  getUserById,
  getUserByEmail,
  updateUser
}