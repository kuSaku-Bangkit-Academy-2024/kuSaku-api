const suggestFirestoreService = require('../services/suggestFirestoreService');
const responseHandler = require('../utils/responseHandler');

exports.getSuggests = async (req, res) => {
  try {
    const userId = req.userId;
    const suggests = await suggestFirestoreService.getSuggests(userId);

    responseHandler.success(res, {data: suggests, message: "Get suggests successfully"});
  } catch (error) {
    responseHandler.error(res, error);
  }
};
