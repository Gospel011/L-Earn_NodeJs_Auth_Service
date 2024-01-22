
const axios = require('axios');
const asyncHandler = require('./asyncHandler');
const util = require('util');


/**
 * sendEmailProd
 * @param {List<Object>} to the list of objects containing name and email of recipients,
 * @param {String} subject the title of the email,
 * @param {String} htmlContent the html content of the email,
 * @param {List<String>} params the object containing the values of the templates used in the html content
 */
exports.sendEmailProd = async(to, subject, htmlContent, params) => {

    //? REQUEST URL
    const url = 'https://api.brevo.com/v3/smtp/email'

    //? REQUEST BODY
    const body = {
        "sender": {
            "name": "Extelvo Group",
            "email": "extelvogroup@gmail.com"
        },
        "to": [...to],
        "subject": subject,
        "htmlContent": htmlContent,
        "params": params
    };


    console.log(`body = ${util.inspect(body)}`);

    //? REQUEST HEADERS
    const headers = {
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY
    }

    //* SEND REQUEST
    const response = await axios.post(url, body, { headers });

    console.log(response);


}


