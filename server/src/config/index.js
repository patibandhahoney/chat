require('dotenv').config();

const origins = (process.env.CLIENT_ORIGIN || '*').split(',').map((s) => s.trim());

module.exports = {
  port: process.env.PORT || 5000,
  dbPath: process.env.DB_PATH || './data/chat.db',
  corsOrigin: origins.includes('*') ? '*' : origins,
};
