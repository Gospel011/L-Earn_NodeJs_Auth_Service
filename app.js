const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const app = express();


const rateLimit = require('express-rate-limit');
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

const limiter = rateLimit({
  max: 200,
  windowMs: 1 * 60 * 60 * 1000,
  message: 'Too many requests. Please try again later',
});

app.use('/api', limiter);


app.get('/', (req, res, next) => {
    res.status(200).json({
        status: "success",
        message: "L-Earn is successfully running on server with keepAlive on"
    })
})

// SANITIZE DATA TO PREVENT NOSQL INJECTION ATTACKS
app.use(mongoSanitize());
// ALLOW CROSS ORIGIN RESOURCE SHARING
app.use('*', cors());

const userRoutes = require('./routes/userRoutes');

//* This is the current api version
const apiVersion = 'v1';
const baseUrl = `/api/${apiVersion}`;

app.use(express.json());
app.use(morgan('dev'));

//* ROUTES
app.use(`/api/${apiVersion}/user`, userRoutes);


// GLOBAL ERROR HANDLER
app.use(globalErrorHandler);



module.exports = app
