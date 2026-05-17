require('dotenv').config();
const http = require('http');
const app = require('./app');
const { initSocket } = require('./src/config/socket');
const sequelize = require('./src/config/db');
const logger = require('./src/utils/logger');

const server = http.createServer(app);
initSocket(server);

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Database connected.');
    await sequelize.sync({ alter: true });
    logger.info('Database synced.');
    server.listen(PORT, () => logger.info(`Server running on http://localhost:${PORT}`));
  } catch (err) {
    logger.error('Startup error: ' + err.message);
    process.exit(1);
  }
};

start();