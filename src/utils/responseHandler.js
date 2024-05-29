exports.success = (res, data) => {
  res.status(200).json({
    status: 'success',
    data
  });
};

exports.error = (res, error) => {
  const statusCode = error.statusCode || 500;
  res.status(statusCode).json({
    status: 'error',
    message: error.message || 'Internal Server Error'
  });
};