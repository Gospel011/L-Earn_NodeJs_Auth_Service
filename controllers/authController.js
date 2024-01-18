const User = require('../models/userModel');
const AppError = require('../utils/appError');
const asyncHandler = require('../utils/asyncHandler');
const jwt = require('jsonwebtoken');

//! const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
const util = require('util');

/**
 *
 * @param {String} id This is the user's id, would be used to reference him in the database
 * @returns jwt String
 */
const signjwt = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRATION_TIME,
  });
};

/**
 *
 * @param {Object} res This is the response object
 * @param {Object} user This is the user object we want to send as part of the response
 * @param {number} statusCode This is the request's status code
 * @param {String} status This is the status of the request
 */
const sendResponseWithToken = (
  res,
  user,
  statusCode = 200,
  status = 'success'
) => {
  const token = signjwt(user._id);

  // Useful for places where i used .select("+password")
  user.password = undefined;
  user.lastChangedPassword = undefined;

  res.status(statusCode).json({
    status,
    token,
    user,
  });
};

/**
   This route signs the user up and creates his profile in the database

   REQUEST BODY
   The request body should be of the form:
   {
  firstName: "test",
  lastName: "human",
  email: "testhuman@gmail.com",
  gender: "male",
  school: "FUTO",
  password: "********",
  confirmPassword: "********",
  }

  RESPONSE:
  The request body would look like this
  {
  "status": "success",
  "message": "user created successfully"
  }
   */
exports.signUp = asyncHandler(async (req, res, next) => {
  const {
    firstName,
    lastName,
    email,

    password,
    confirmPassword,
  } = req.body;

  const newUser = await User.create({
    firstName,
    lastName,
    email,
    password,
    confirmPassword,
  });

  newUser.password = undefined;
  newUser.lastChangedPassword = undefined;
  res.status(201).json({
    status: 'success',
    message: 'user created successfully',
    data: {
      newUser,
    },
  });
});

/**
   This route logs the user in using the provided email and password
   and gives him an access token that is valid for 30days.

   REQUEST BODY
   The request body should be of the form:
   {
  "email": "test@gmail.com",
  "password": "12345678"
  }

  RESPONSE
  The response would look like this:
  {
  "status": "success",
  "token": "nfaAfahgaHGAjgahJHhJjhfjjmcnzfahjgsbvajfjJHHJJLKjudjenfabbUJAHUEFJHADHFUHFhjhjhlihbasklfjfha",
  "user": {
      "_id": "64jfan885qjh5353jh533",
      "firstName": "test",
      "lastName": "human",
      "email": "testhuman@gmail.com",
      "gender": "female",
      "school": "FUTO",
      "role": "user",
      "__v": 0
  }
}
   */
exports.login = asyncHandler(async (req, res, next) => {
  //Get the email and password from the request body
  const { email, password } = req.body;
  if (!email || !password)
    return next(new AppError('please provide your email and password', 400));

  //Get user corresponding to the email

  const user = await User.findOne({ email }).select('+password');
  if (!user) return next(new AppError('Username or password is incorrect!'));

  //check if the password from the request body is correct
  const correctPassword = await user.checkPassword(password, user.password);

  if (!correctPassword)
    return next(new AppError('Username or password is incorrect!', 400));

  //send access token to the client
  sendResponseWithToken(res, user);
});

/**
 * ## This Middleware checks if the user's email exist in the database
 * ### Request body Parameters
 * @param {String} email (required)
 */
exports.emailExists = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  console.log('E M A I L F R O M C L I E N T: ' + email);

  // TODO -- Send back a more vague error message
  if (!email) return next(new AppError('please provide a valid email!', 400));

  // Confirm  if the user with requested email exists
  const user = await User.findOne({ email });
  if (!user)
    return next(
      new AppError(
        'This user does not exist. please signup or provide a valid user email.',
        400
      )
    );

  // Attach the user to the request object
  req.user = user;
  next();
});

/**
 * ## This function returns a middleware that sends an email to the user.
 * ### NOTE:
 * For this function to work, the request must have the user object attached to it.
 * Also, if you need to verify the identity, use the generateOtp middleware before this one.
 * #### i.e [ req.user ] not be empty!
 *
 * ## ARGUMENTS
 * @param {String} subject
 * @param {String} text
 *
 * ## RESPONSE
 * The response would look like this:
 * {
 * "status": "success",
 * "message": "Email sent successfully"
 * }
 */

//!...........................................................
exports.sendMail = (subject, text) => {
  return asyncHandler(async (req, res, next) => {
    console.log(' o t p in s e n d mail ' + req.otp);
    if (req.otp != undefined) {
      const newText = text.replace(/<<OTP>>/g, req.otp);
      console.log({ newText });

      //? Send email
      await sendEmail(req.body.email, subject, newText);
    } else {
        //? Send email
        await sendEmail(req.body.email, subject, text);
    }
    res.status(200).json({
      status: 'success',
      message: 'Email sent successfully',
    });
  });
};

/**
 * ## This middleware generates on otp, saves it to the user model and attaches it to the request object incase you need to use it in another middleware.
 * #
 * ### NOTE:
 * [emailExists] middleware should be called before this to ensure the user with that email exists and
 * #
 *  that the request object would have the user object which would be needed in this middleware.
 */

exports.generateOTP = asyncHandler(async (req, res, next) => {
  //? Generate random six digit token
  // console.log('R E Q U E S T = ' + util.inspect(req));
  //  originalUrl: '/api/v1/user/forgot-password',

  const originalUrlList = req.originalUrl.split('/');

  const originalUrl = originalUrlList[originalUrlList.length - 1];

  console.log('O R I G I N A L URL ' + originalUrl);

  var otp;

  if (originalUrl === 'forgot-password') {
    otp = await req.user.generateOTP('password');
  } else if (originalUrl === 'send-email-otp') {
    otp = await req.user.generateOTP('email');
  } 
  console.log('G E N E R A T E D OTP = ' + otp);
  await req.user.save({ validateBeforeSave: false });

  req.otp = otp;
  next();
});

/**
   * ## This middleware sets the users [emailVerified] property to true and sends the response to the client
   * #### NOTE: 
   * For this to work, the [user] object must be attached to the request object.
   *  Also the verifyOtp method should be called first for security reasons.
   * ### RESPONSE
   * The response would look like this:
  {
  "status": "success",
  "message": "Your email has been verified successfully"
  }
   */
exports.verifyEmail = asyncHandler(async (req, res, next) => {
  const user = req.user;
  user.emailVerified = true;

  //? reset the otp and otpExpiryDateFields
  user.emailOtp = undefined;
  user.otpExpiryDate = undefined;
  await user.save({ validateBeforeSave: false });
  res.status(200).json({
    status: 'success',
    message: 'Your email has been verified successfully',
  });
});

/**
 * ## This route resets the user's password
 * #### NOTE:
 * The verifyOtp middleware should be called before this middleware.
 *
 * ### REQUEST BODY
 * @param newPassword: required
 * @param newPasswordConfirm: required
 * ### example
 *  {
 * "otp": "****"
 * "newPassword": "******"
 * "newPasswordConfirm": "******"
 * }
 * ### RESPONSE
 * The response would look like this
 * {
 * "status": "success",
 * "message": "password reset successful. You can now login with your new password"
 * }
 */

exports.resetPassword = asyncHandler(async (req, res, next) => {
  // Get the otp from the user and hash it
  const { newPassword, newPasswordConfirm } = req.body;

  // If the user exist, reset his password
  req.user.password = newPassword;
  req.user.confirmPassword = newPasswordConfirm;
  req.user.otp = undefined;
  req.user.otpExpiryDate = undefined;

  await req.user.save();
  // Send response to client

  res.status(200).json({
    status: 'success',
    message:
      'password reset successful. You can now login with your new password',
  });
});

/**
 * ## This middleware verifies that the otp provided corresponds to the one in the database.
 * ### NOTE: This middleware attaches the user to the request object.
 *
 * ### REQUEST BODY
 * @param otp: required
 *
 */
exports.verifyOtp = asyncHandler(async (req, res, next) => {
  //? Get otp from request body
  const { otp } = req.body;

  if (!otp)
    return next(new AppError('Please provide an OTP to continue.', 400));

  //? hash the otp
  const hashedOTP = crypto.createHash('sha256').update(otp).digest('hex');
  console.log('H A S H E D OTP = ' + otp);

  //? Get the user who has the valid otp that has not yet expired
  var user;

  const originalUrlList = req.originalUrl.split('/');

  const originalUrl = originalUrlList[originalUrlList.length - 1];

  console.log('O R I G I N A L URL ' + originalUrl);

  if (originalUrl === 'reset-password') {
    user = await User.findOne({
      passwordOtp: hashedOTP,
      otpExpiryDate: { $gt: Date.now() },
    });
  } else if (originalUrl === 'verify-email') {
    user = await User.findOne({
      emailOtp: hashedOTP,
      otpExpiryDate: { $gt: Date.now() },
    });
  } 

  if (!user)
    return next(new AppError('This OTP is either invalid or has expired', 400));

  //? Attach the user to the request object
  req.user = user;
  next();
});

/**
   This route verifies that the user is logged in using the provided token in the header's authorization field.
   If the user is logged in, he can then access the routes meant for logged in users
   but if not, an error message would be sent to the client asking the user to login
   and then provide an access token (JWT)
   

   REQUEST HEADERS
   The request header should contain the authorization field in the "Bearer token" format:
   {
  "authorization": "Bearer nfaAfahgaHGAjgahJHhJjhfjjmcnzfahjgsbvajfjJHHJJLKjudjenfabbUJAHUEFJHADHFUHFhjhjhlihbasklfjfha"
  }

  RESPONSE
  The response would look like this if the user is not authorized
  {
  "status": "fail",
  "message": "You are not allowed to access this resource. Please login to your account again."
  }
*/
exports.isLoggedIn = asyncHandler(async (req, res, next) => {

  // VERIFY AUTH TOKEN
  // Confirm that the headers has an authorization field
  const { authorization } = req.headers;
  if (!authorization)
    return next(
      new AppError(
        'You are not allowed to access this resource. Please login to your account again.'
      ),
      401
    );

  //* Extract the access token from the authorization field
  const token = authorization.split(' ')[1];

  if (!token)
    return next(
      new AppError(
        'This token is either invalid or has expired. Please login again and provide an access token'
      ),
      401
    );

  //* Confirm that the token is valid and that the payload has not been tampered with
  let verifiedPayload;
  jwt.verify(token, process.env.JWT_SECRET_KEY, (err, payload) => {
    if (!err) verifiedPayload = payload;
  });

  if (!verifiedPayload)
    return next(
      new AppError(
        'This token is either invalid or has expired. Please login again and provide an access token'
      ),
      401
    );

  //* Confirm that the jwt has not expired
  //PAYLOAD: { id: '6516fb4baa4fa2303fa9a178', iat: 1696005053, exp: 1698597053 }

  if (verifiedPayload.exp < Date.now() / 1000)
    return next(
      new AppError(
        'This token is either invalid or has expired. Please login again and provide an access token'
      ),
      401
    );

  // Get the user whose id is in the jwt payload
  const user = await User.findOne({ _id: verifiedPayload.id }).select(
    '+lastChangedPassword'
  );
  if (!user)
    return next(
      new AppError(
        'This user does not exist. please login with a valid account to gain access to this resource'
      ),
      401
    );

  // Confirm that the user has not changed his password since the jwt was issued

  const changedPasswordAfterJwtWasIssued =
    user.changedPasswordAfterJwtWasIssued(verifiedPayload.iat);

if (changedPasswordAfterJwtWasIssued == true) {
    return next(new AppError('Please login with your new password.'));
}
// Attach the user to the request object
req.user = user;

// GRANT ACCESS
// console.log('USER ACCESSING THIS RESOURCE', req.user)
next();

});

exports.updateProfile = asyncHandler(async (req, res, next) => {
  /*
     This route is similar to the signup route, but instead of creating new users,
     it modifies the existing user.

     PLEASE NOTE: This route is for logged in users which means that any request to this route
     must contain an access token in the headers' authorization field of the form "Bearer Token".
     
     Also, if the currentPassword is not specified, then NO password update operation would be
     carried out.

     REQUEST BODY
     With all fields except the last three being MANDATORY, the request body should be of the form:
     {
    firstName: "test",
    lastName: "human",
    email: "testhuman@gmail.com",
    gender: "male",
    school: "FUTO",
    currentPassword: "********"
    newPassword: "********",
    newConfirmPassword: "********",
    }


    RESPONSE:
    The request body for a successful operation would look like this
    {
    "status": "success",
    "message": "user profile updated successfully"
    }
     */

    
    console.log("F I L E N A M E IS " + req.file.filename);
    
    /// Get update fields from the request body
    const {
        firstName,
        lastName,
        email,
        gender,
        school,
        currentPassword,
        newPassword,
        newConfirmPassword,
    } = req.body;
    
    // TODO -- Refactor this into it's own function
    
    const user = await User.findOne({ _id: req.user._id }).select('+password');
    


    let previousPublicId;
  if (user.profilePicture != 'default.png') {
    previousPublicId = user.profilePicture
      .split('/')
      .slice(-1)[0]
      .split('.')[0];
  }


//* IMMEDIATELY SEND BACK THE CURRENT USER AND RETURN IF THE REQUEST BODY IS EMPTY
console.log(`req.body is empty = ${util.inspect(Object.keys(req.body).length == 0)}`);



  if (currentPassword) {
    // Verify the current password
    const correctPassword = await req.user.checkPassword(
      currentPassword,
      user.password
    );
    if (!correctPassword)
      return next(new AppError('Your current password is incorrect', 400));

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    // user.email = email || user.email;
    user.gender = gender || user.gender;
    user.school = school || user.school;
    user.password = newPassword;
    user.confirmPassword = newConfirmPassword;

    if (req.file)
      user.profilePicture = req.file.filename || user.profilePicture;

    await user.save();
  } else {
    console.log("IN E L S E " + req.file);
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    // user.email = email || user.email;
    user.gender = gender || user.gender;
    user.school = school || user.school;
    

    if (req.file)
      user.profilePicture = req.file.filename || user.profilePicture;

    await user.save();
  }

  res.status(200).json({
    status: 'success',
    message: 'user profile updated successfully',
    user,
  });
});
