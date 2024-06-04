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

  const userId = user.id;
  const userTarget = db.collection('users').doc(userId);
  const token = jwt.sign({ id: userId }, jwtSecret.secret, jwtSecret.options);
  const refreshToken = jwt.sign({ id: userId }, jwtRefresh.secret, jwtRefresh.options);
  
  userTarget.update({refreshToken});

  return { token, refreshToken };
};

exports.deleteToken = async (userId) => {
  const db = new Firestore({
    databaseId: process.env.DATABASE
  });

  const userTarget = db.collection('users').doc(userId);

  userTarget.update({refreshToken: ""});
}

exports.getUserToken = async (token) => {
  const db = new Firestore({
    databaseId: process.env.DATABASE
  });

  const userSnapshot = await db.collection('users').where('refreshToken', '==', token).get();
  
  const data = [];
  userSnapshot.forEach(doc => {
    data.push(doc.data());
  });
  
  return !(data.length);
}

exports.generateToken = async (token) => {
  let data = {}
  jwt.verify(token, jwtRefresh.secret, (err, user) => {
    if (err) throw new Error('Failed to authenticate token', 401);
    
    data.accessToken = jwt.sign({ id: user.id }, jwtSecret.secret, jwtSecret.options);
  });

  return data;
}
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImU4MTg4MGFkLTEzZmUtNGExMS05ZDg1LWIxMTkzMjdhM2QyYiIsImlhdCI6MTcxNzQ4Nzc2NSwiZXhwIjoxNzIwMDc5NzY1fQ.0SZA2dY_jr9KsHASaMIuG-mR4Lrb9rwfL4AcEwjZJsE
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImU4MTg4MGFkLTEzZmUtNGExMS05ZDg1LWIxMTkzMjdhM2QyYiIsImlhdCI6MTcxNzQ4Nzc2NSwiZXhwIjoxNzIwMDc5NzY1fQ.0SZA2dY_jr9KsHASaMIuG-mR4Lrb9rwfL4AcEwjZJsE