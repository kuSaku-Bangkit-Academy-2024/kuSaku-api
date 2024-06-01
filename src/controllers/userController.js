const responseHandler = require('../utils/responseHandler');
const userFirestoreService = require('../services/userFirestoreService');
const User = require('../models/user');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const ClientError = require('../utils/clientError')

const register = async (req, res) => {
  try {
    const userId = crypto.randomUUID();

    let body = req.body;
    body.password = bcrypt.hashSync(body.password, 7);
    
    const user = new User({id: userId, ...body});

    user.validate();

    const match = bcrypt.compareSync(body.confirm_password, body.password);
    if(!match){
      throw new ClientError(`Passwords do not match`, 400);
    }
    
    const taken = await userFirestoreService.getUserByEmail(body.email);

    if(taken.length){
      throw new ClientError(`Email already exists`, 409);
    }

    await userFirestoreService.register(user.toFirestore());

    responseHandler.success(res, {message: "User registered successfully"}, 201);
  } catch (error) {
    responseHandler.error(res, error);
  }
};

const getUser = async (req, res) => {
  try {
    const userId = req.userId;
    const dataUser = await userFirestoreService.getUserById(userId);

    const user = new User(dataUser);

    responseHandler.success(res, {data: user.toInterface()});
  } catch (error) {
    responseHandler.error(res, error);
  }
};

const updateUser = async (req, res) => {
  try {
    let updateData = req.body;
    updateData.id = req.userId;
    updateData.password = 'dummy';

    const user = new User(updateData);
    user.validate();

    updateData = user.toFirestore();
    delete updateData.password;

    await userFirestoreService.updateUser(updateData.id, updateData);
    
    responseHandler.success(res, {'message': `User's successfully updated`});
  } catch (error) {
    responseHandler.error(res, error);
  }
};

module.exports = {
  register,
  getUser,
  updateUser
};