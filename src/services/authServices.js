const { Firestore } = require('@google-cloud/firestore');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { secret, options } = require('../configs/jwt');

exports.login = async (data) => {
  const db = new Firestore();
  const { email, password } = data;
  const userSnapshot = await db.collection('users').where('email', '==', email).get();

  if (userSnapshot.empty) {
    throw new Error('User not found');
  }

  const user = userSnapshot.docs[0].data();
  const passwordIsValid = await bcrypt.compare(password, user.password);

  if (!passwordIsValid) {
    throw new Error('Invalid password');
  }

  const token = jwt.sign({ id: userSnapshot.docs[0].id }, secret, options);
  return { token };
};
