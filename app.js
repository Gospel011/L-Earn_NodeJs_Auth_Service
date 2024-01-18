const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const app = express();


// const userRoutes = require('../server/routes/userRoutes');
const globalErrorHandler = require('./controllers/errorController');

require('dotenv').config();


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