const authService = require('../services/authServices');
const responseHandler = require('../utils/responseHandler');

exports.login = async (req, res) => {
  try {
    const token = await authService.login(req.body);
    responseHandler.success(res, token);
  } catch (error) {
    responseHandler.error(res, error);
  }
};
