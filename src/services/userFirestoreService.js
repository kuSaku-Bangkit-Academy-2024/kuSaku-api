const { Firestore } = require('@google-cloud/firestore');

exports.register = async (data) => {
  const db = new Firestore();
  return db.collection('users').doc(data.id).set(data);
};

exports.getUser = async (userId) => {
  const db = new Firestore();
  const userById = await db.collection('users').doc(userId).get();
  if (!userById.exists){
    throw new Error('User not found');
  }
  return userById.data();
};

exports.updateUser = async (userId, data) => {
  const db = new Firestore();
  const userTarget = db.collection('users').doc(userId);
  await userTarget.update(data);
  const updatedUser = await userTarget.get();
  return updatedUser.data();
};

