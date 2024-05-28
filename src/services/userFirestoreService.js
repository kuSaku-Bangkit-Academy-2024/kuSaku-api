const { Firestore } = require('@google-cloud/firestore');

exports.createUser = async (data) => {
  const db = new Firestore();
  const userRef = db.collection('users').doc().set(data);
  return { id: userRef.id, ...data };
};

exports.getUser = async (userId) => {
  const db = new Firestore();
  const userById = await db.collection('users').doc(userId).get();
  return { userById };
};

exports.updateUser = async (userId, data) => {
  const db = new Firestore();
  const userRef = db.collection('users').doc(userId);
  await userRef.update(data);
  const updatedUser = await userRef.get();
  return { id: userId, ...updatedUser.data() };
};

