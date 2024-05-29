const responseHandler = require('../utils/responseHandler');
const userFirestoreService = require('../services/userFirestoreService');
const User = require('../models/user');
const crypto = require('crypto');

exports.register = async (req, res) => {
  try {
    const userId = crypto.randomUUID();

    const user = new User({userId, ...req.body});

    user.validate();

    const userData = await userFirestoreService.register(user.toFirestore());

    responseHandler.success(res, userData);
  } catch (error) {
    responseHandler.error(res, error);
  }
};

exports.getUser = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await userFirestoreService.getUserById(userId);
    responseHandler.success(res, user);
  } catch (error) {
    responseHandler.error(res, error);
  }
};

exports.updateUser = async (req, res) => {
  try {
    const userId = req.userId;
    const updateData = req.body;
    const updatedUser = await userFirestoreService.updateUser(userId, updateData);
    responseHandler.success(res, updatedUser);
  } catch (error) {
    responseHandler.error(res, error);
  }
};