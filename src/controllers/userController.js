const responseHandler = require('../utils/responseHandler');
const userFirestoreService = require('../services/userFirestoreService');

exports.register = async (req, res) => {
  try {
    const user = await userFirestoreService.register(req.body);
    responseHandler.success(res, user);
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