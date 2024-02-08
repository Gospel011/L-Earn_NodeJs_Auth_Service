
const axios = require('axios');
const asyncHandler = require('./asyncHandler');
const util = require('util');
const nodemailer = require('nodemailer');


/**
 * sendEmailProd
 * @param {List<Object>} to the list of objects containing name and email of recipients,
 * @param {String} subject the title of the email,
 * @param {String} htmlContent the html content of the email,
 * @param {List<String>} params the object containing the values of the templates used in the html content
 */
exports.sendEmailProd = async(to, subject, htmlContent, params) => {

    //!.....................................................
//     // / Get details for transporter
//   const MAIL_HOST = process.env.MAIL_HOST;
//   const MAIL_PORT = process.env.MAIL_PORT;
//   const MAIL_USERNAME = process.env.MAIL_USERNAME;
//   const MAIL_PASSWORD = process.env.MAIL_PASSWORD;
  
//   console.log({
//     MAIL_HOST,
//     MAIL_PORT,
//     MAIL_USERNAME,
//     MAIL_PASSWORD,
//   });

//   // Create Transporter.
//   //* A transporter configures the Mailing service you intend to use
//   const transporter = nodemailer.createTransport({
//     host: MAIL_HOST,
//     port: MAIL_PORT,
//     auth: {
//       user: MAIL_USERNAME,
//       pass: MAIL_PASSWORD,
//     },
//   });

//   // Send the email alongside the mailOptionse

//   const mailOptions = {
//     from: 'extelvogroup@gmail.com',
//     to: 'random@gmail.com',
//     subject: subject,//'Password reset email',
//     html: params.otp.toString(),//`Forgot your password? Use this one time password (OTP) to reset it.\nOTP: ${otp}`,
//   };

//   // console.log("M a i l o p t i o n s " + mailOptions);

//   console.log("sending email to user's email");
//   await transporter.sendMail(mailOptions);

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

    // console.log(response);


}


