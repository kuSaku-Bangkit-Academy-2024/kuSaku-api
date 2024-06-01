const jwtSecret = {
    secret: process.env.JWT_SECRET,
    options: {
      expiresIn: '1d'
    }
};

const jwtRefresh = {
    secret: process.env.JWT_SECRET_REFRESH,
    options: {
      expiresIn: '1h'
    }
};

module.exports = {jwtRefresh, jwtSecret}