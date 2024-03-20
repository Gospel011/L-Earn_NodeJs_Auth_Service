const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const app = express();

const rateLimit = require('express-rate-limit');
const compression = require('compression');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');
const cors = require('cors');

// const userRoutes = require('../server/routes/userRoutes');
const globalErrorHandler = require('./controllers/errorController');

require('dotenv').config();

// SET SECURITY HEADERS USING HELMET
app.use(helmet());

// PREVENT HTTP PARAMETER POLLUTION
app.use(hpp());

// LIMIT REQUESTS BEYOND A CERTAIN THRESHOLD

// const limiter = rateLimit({
//   max: 700,
//   windowMs: 1 * 60 * 60 * 1000,
//   message: 'Too many requests. Please try again later',
// });

// const tutorialPostLimiter = rateLimit({
//   max: 3,
//   windowMs: 24 * 1 * 60 * 60 * 1000,
//   message: "You've created too many tutorials today, please try again tommorow",
// });

// app.use('/api', limiter);
// app.use('/api/tutorials', tutorialPostLimiter)

app.use(compression({
  level: 6,
  threshold: 100
}));

app.get('/emman222/server/test', (req, res, next) => {
  res.status(200).json({
    status: 'success',
    message: 'L-Earn is successfully running on server with keepAlive on',
  });
});

app.get('/', (req, res, next) => {
  res.redirect("https://drive.google.com/drive/folders/1HJ9oeOu6U0zjoKmJdmSxFvTNEK6PtNyD");
});

// SANITIZE DATA TO PREVENT NOSQL INJECTION ATTACKS
app.use(mongoSanitize());

// DISALLOW CROSS ORIGIN RESOURCE SHARING
app.use('*', cors());

const userRoutes = require('./routes/userRoutes');
const contentRoutes = require('./routes/contentRoutes');
const postRoutes = require('./routes/postRoutes.js');
const webhookRoutes = require('./routes/webhook.js');
const paymentRoutes = require('./routes/paymentRoutes.js');

//* This is the current api version
const apiVersion = 'v1';
const baseUrl = `/api/${apiVersion}`;

app.use(express.json());
app.use(morgan('dev'));
app.use(express.static('./public'));

//* ROUTES
app.use(`/api/${apiVersion}/user`, userRoutes);
app.use(`/api/${apiVersion}/contents`, contentRoutes);
app.use(`/api/${apiVersion}/posts`, postRoutes);
app.use(`/webhooks/${apiVersion}/mnfy-webhook`, webhookRoutes);
app.use(`/api/${apiVersion}/payment`, paymentRoutes);



// GLOBAL ERROR HANDLER
app.use(globalErrorHandler);

module.exports = app;
