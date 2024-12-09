//General packages
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
//Packages For security
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

//Local modules
const userRouter = require('./routes/userRoutes');
const classRouter = require('./routes/classRoutes');
const AppError = require('./utils/AppError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();
app.use(cors());
app.options('*', cors());
// Set security HTTP headers
app.use(helmet());

//This will limit the requests sent to the server from an IP. Currently, the limit is 100 requests per hour.
const limiter = rateLimit({
  max: 10000,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP.Please try again in an hour.',
});
app.use('/api', limiter);

//express.json and cookieParser for parsing request body and cookie that comes from requests.
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

//Data sanitization agains NoSQL query injection and XSS attacks.
app.use(mongoSanitize());
app.use(xss());

// app.use((req, res, next) => {
//   console.log(req.cookies.jwt);
//   next();
// });
app.use('/api/home', (req, res, next) => {
  res.status(200).json({
    success: true,
    message:
      'Hello welcome to the gym management app created by Mashrafie Rahim Sheikh. Please refer to the documentation to get the endpoints.',
    docLink: 'https://documenter.getpostman.com/view/36963920/2sAYBd7oEX',
    gitLink: 'https://github.com/m3tal10/Gym-management',
  });
});

app.use('/api/v1/users', userRouter);
app.use('/api/v1/classes', classRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server.`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
