const axios = require('axios');
const asyncHandler = require('./asyncHandler');
require('dotenv').config();

exports.login = async () => {
  const apiKey = process.env.API_KEY;
  const apiSecret = process.env.API_SECRET;
  const base64Buffer = Buffer.from(`${apiKey}:${apiSecret}`, 'utf-8');
  const base64Str = base64Buffer.toString('base64');
  const baseUrl = process.env.BASE_URL;
  const headers = {
    Authorization: `Basic ${base64Str}`,
    'Content-Type': 'application/json',
  };

  const response = await axios.post(`${baseUrl}/api/v1/auth/login`, null, {
    headers,
  });

  return response.data.responseBody.accessToken;
};

exports.generateReference = (id) => {
  let randomNumber = Math.random();

  let randomAdjustedNumber = Math.random() * (1e9 - 2);

  let roundedRandomNumber = Math.round(randomAdjustedNumber);

  let finalRandomNumber = roundedRandomNumber + 1;

  const ref = `${finalRandomNumber}${id.toString().slice(-6)}${Date.now()}`;

  console.log(finalRandomNumber);

  return ref;
};
