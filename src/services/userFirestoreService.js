const { Firestore } = require('@google-cloud/firestore');
const ClientError = require('../utils/clientError');

exports.register = async (data) => {
  const db = new Firestore({
    databaseId: "kusaku"
  });
  const userCollection = db.collection('users');
  
  return await userCollection.doc(data.id).set(data);
};

exports.getUserById = async (userId) => {
  const db = new Firestore({
    databaseId: "kusaku"
  });
  const userById = await db.collection('users').doc(userId).get();

  if (!userById.exists){
    throw new ClientError('User not found', 400);
  }
  return userById.data();
};

exports.getUserByEmail = async (email) => {
  const db = new Firestore({
    databaseId: "kusaku"
  });
  const userByEmail = await db.collection('users').where('email', '==', email).get();
  
  const data = [];
  userByEmail.forEach(doc => {
      data.push(doc.data());
  });

  return data;
}

exports.updateUser = async (userId, data) => {
  const db = new Firestore({
    databaseId: "kusaku"
  });
  
  const userTarget = db.collection('users').doc(userId);
  await userTarget.update(data);
};