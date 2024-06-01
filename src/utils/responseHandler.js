exports.success = (res, data, statusCode=200) => {
  res.status(statusCode).json({
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