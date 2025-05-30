require('dotenv').config();

module.exports = {
  DB_CONFIG: {
    HOST: process.env.DB_HOST,
    USER: process.env.DB_USER,
    PASSWORD: process.env.DB_PASSWORD,
    NAME: process.env.DB_NAME
  },
  JWT: {
    SECRET: process.env.JWT_SECRET,
    EXPIRES_IN: process.env.JWT_EXPIRES_IN || '5h'
  },
  SERVER: {
    PORT: process.env.PORT || 5000
  }
};