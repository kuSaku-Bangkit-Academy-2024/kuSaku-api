const { Firestore } = require('@google-cloud/firestore');
const User = require('../models/user');

exports.register = async (data) => {
  const db = new Firestore();
  // if salah satu kosong:
  const user = new User(data.id);
  return db.collection('users').doc(data.id).set(user.toFirestore());
};

exports.getUser = async (userId) => {
  const db = new Firestore();
  const userById = await db.collection('users').doc(userId).get();
  if (!userById.exists){
    throw new Error('User not found');
  }
  return User.fromFirestore(userById);
};

exports.updateUser = async (userId, data) => {
  const db = new Firestore();
  const userTarget = db.collection('users').doc(userId);
  await userTarget.update(data);
  const updatedUser = await userTarget.get();
  return User.fromFirestore(updatedUser);
};

