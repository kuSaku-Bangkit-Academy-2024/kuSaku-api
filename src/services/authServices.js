const { Firestore } = require('@google-cloud/firestore');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { jwtSecret, jwtRefresh } = require('../configs/jwt');
const ClientError = require('../utils/clientError');

exports.login = async (data) => {
  const db = new Firestore({
    databaseId: process.env.DATABASE
  });
  const { email, password } = data;
  const userSnapshot = await db.collection('users').where('email', '==', email).get();

  if (userSnapshot.empty) {
    throw new ClientError('User not found', 404);
  }

  const user = userSnapshot.docs[0].data();
  const passwordIsValid = await bcrypt.compare(password, user.password);

  if (!passwordIsValid) {
    throw new ClientError('Invalid credentials', 401);
  }

  const token = jwt.sign({ id: userSnapshot.docs[0].id }, jwtSecret.secret, jwtSecret.options);
  return { token };
};
