exports.success = (res, data) => {
  res.status(200).json({
    status: 'success',
    data
  });
};

exports.error = (res, error) => {
  res.status(500).json({
    status: 'error',
    message: error.message || 'Internal Server Error'
  });
};