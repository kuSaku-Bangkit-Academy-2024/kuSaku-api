const authService = require('../services/authServices');
const ClientError = require('../utils/clientError');
const responseHandler = require('../utils/responseHandler');

exports.login = async (req, res) => {
  try {
    const {email, password} = req.body;

    if (!email || !password){
      throw new ClientError('Email and Password are required', 400);
    }

    const token = await authService.login(req.body);
    responseHandler.success(res, {message: "Login successful", ...token});
  } catch (error) {
    responseHandler.error(res, error);
  }
};
