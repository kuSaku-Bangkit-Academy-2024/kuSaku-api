const authService = require('../services/authServices');
const userFirestoreService = require('../services/userFirestoreService');
const ClientError = require('../utils/clientError');
const responseHandler = require('../utils/responseHandler');

exports.login = async (req, res) => {
  try {
    const {email, password} = req.body;

    if (!email || !password){
      throw new ClientError('Email and Password are required', 400);
    }

    const { token, refreshToken } = await authService.login(req.body);
    responseHandler.success(res, {data: { accessToken: token, refreshToken }, message: "Login successful"});
  } catch (error) {
    responseHandler.error(res, error);
  }
};

exports.token = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) throw new ClientError("No token provided!", 400);
    
    const isEmpty = await authService.getUserToken(refreshToken);
    if(isEmpty) throw new ClientError('Failed to authenticate token', 401);

    const data = await authService.generateToken(refreshToken);
    
    responseHandler.success(res, {data});
  } catch (error) {
    responseHandler.error(res, error);
  }
}

exports.logout = async (req, res) => {
  try{
    await authService.deleteToken(req.userId);

    responseHandler.success(res, {}, 204);
  } catch (error) {
    responseHandler.error(res, error);
  }
}

exports.sendLink = async (req, res) => {
  try {
    const { email } = req.body;

    throw new ClientError("This feature isn't available yet", 403);
    
    const exist = await userFirestoreService.getUserByEmail(email);

    if(!exist.length){
      throw new ClientError('User not Found', 404);
    }
    
    const token = jwt.sign({ email }, refreshToken.secret, { expiresIn: '15m' });
    const front_end_url = "";
    const kusakuEmail = "";

    const mailOptions = {
      from: kusakuEmail,
      to: email,
      subject: 'Password Reset',
      text: `Click the link to reset your password: ${front_end_url}?token=${token}`
    };

    transporter.sendMail(mailOptions, (error, _info) => {
      if (error) {
          throw new Error('Failed to send email');
      }
      responseHandler.success(res, {message: 'Reset password email sent'});
  });

  } catch (error) {
    responseHandler.error(res, error);
  }
}