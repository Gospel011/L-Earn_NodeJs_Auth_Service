const nodemailer = require('nodemailer');

module.exports = async (email, subject, text) => {
  // Get details for transporter
  const MAIL_HOST = process.env.MAIL_HOST;
  const MAIL_PORT = process.env.MAIL_PORT;
  const MAIL_USERNAME = process.env.MAIL_USERNAME;
  const MAIL_PASSWORD = process.env.MAIL_PASSWORD;
  
  console.log({
    MAIL_HOST,
    MAIL_PORT,
    MAIL_USERNAME,
    MAIL_PASSWORD,
  });

  // Create Transporter.
  //* A transporter configures the Mailing service you intend to use
  const transporter = nodemailer.createTransport({
    host: MAIL_HOST,
    port: MAIL_PORT,
    auth: {
      user: MAIL_USERNAME,
      pass: MAIL_PASSWORD,
    },
  });

  // Send the email alongside the mailOptionse

  const mailOptions = {
    from: 'lodgemate@gmail.com',
    to: email,
    subject: subject,//'Password reset email',
    text: text,//`Forgot your password? Use this one time password (OTP) to reset it.\nOTP: ${otp}`,
  };

  // console.log("M a i l o p t i o n s " + mailOptions);

  console.log("sending email to user's email");
  await transporter.sendMail(mailOptions);
};
