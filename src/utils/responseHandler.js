exports.success = (res, { data={}, message='' }, statusCode=200) => {
  const response = {
    status: 'success'
  };
  
  if (message) {
    response.message = message;
  }
  
  if (Object.keys(data).length > 0) {
    response.data = data;
  }

  res.status(statusCode).json(response);
};

exports.error = (res, error) => {
  const statusCode = error.statusCode || 500;
  res.status(statusCode).json({
    status: 'error',
    message: error.message || 'Internal Server Error'
  });
};