const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../configs/jwt');
const ClientError = require('../utils/clientError');
const responseHandler = require('../utils/responseHandler');

module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  try {
    if (!token) {
      throw new ClientError('No token provided!', 401);
    }
  
    jwt.verify(token, jwtSecret.secret, (err, decoded) => {
      if (err) {
        throw new Error('Failed to authenticate token', 401);
      }
      req.userId = decoded.id;
      next();
    });
  } catch(error){
    responseHandler.error(res, error);
  }
};
