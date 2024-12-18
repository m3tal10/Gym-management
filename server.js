const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
  console.log('Unhandled rejection! Shutting Down...');
  console.log(err);
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

const DB = process.env.MONGODB_CONNECTION_STRING.replace(
  '<PASSWORD>',
  process.env.MONGODB_PASSWORD,
);

mongoose.connect(DB).then(() => console.log('DB connection successful...'));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}`);
});

process.on('unhandledRejection', (err) => {
  console.log('Unhandled rejection! Shutting Down...');
  console.log(err);
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  console.log('SIGTERM RECEIVED... Shutting down...');
  server.close(() => {
    console.log('Process terminated...');
  });
});
