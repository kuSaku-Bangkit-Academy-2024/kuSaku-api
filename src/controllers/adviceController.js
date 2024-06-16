const adviceFirestoreService = require('../services/adviceFirestoreService');
const responseHandler = require('../utils/responseHandler');

exports.getAdvices = async (req, res) => {
  try {
    const userId = req.userId;
    const advices = await adviceFirestoreService.getAdvicesMonth(userId);

    responseHandler.success(res, {data: advices});
  } catch (error) {
    responseHandler.error(res, error);
  }
};

exports.add = async (req, res) => {
  try {
    await adviceFirestoreService.addAdvicesDummy();

    responseHandler.success(res, {message: "SUKSES MAS"});
  } catch (error) {
    responseHandler.error(res, error);
  }
}
