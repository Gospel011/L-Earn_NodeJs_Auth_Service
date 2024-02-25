const express = require('express');
const authController = require('./../controllers/authController');
const multerHandler = require('./../utils/multerHandler');

const router = express.Router();

console.log('in user routes');

router.get('/:id', authController.isLoggedIn, authController.getUser)

//* SIGNUP ROUTE
router.put('/signup', authController.signUp);

//* LOGIN ROUTE
router.post('/login', authController.login);

//* FORGOT PASSWORD ROUTE
router.post(
  '/forgot-password',
  authController.emailExists,
  authController.generateOTP,
  authController.sendMail('L-Earn Password reset email')
);

//* RESET PASSWORD ROUTE
router.patch(
  '/reset-password',
  authController.verifyOtp,
  authController.resetPassword
);

//* SEND EMAIL OTP ROUTE
router.post(
  '/send-email-otp',
  authController.emailExists,
  authController.generateOTP,
  authController.sendMail('Verify your L-Earn account')
);

//* VERIFY EMAIL ROUTE
router.post(
  '/verify-email',
  authController.verifyOtp,
  authController.verifyEmail
);

// Update profile
// router.patch(
//   '/update-profile',
//   authController.isLoggedIn,
//   multerHandler.getProfilePicture,
//   multerHandler.processAndUploadImageToCloud('profilePicture'),
//   authController.updateProfile
// );

// Update profile
router.patch(
  '/update-profile',
  authController.isLoggedIn,
  multerHandler.upload.fields([
    {name: "profilePicture", maxCount: 1},
    {name: "banner", maxCount: 1}
  ]),
  multerHandler.processAndUploadMultipleImagesToCloud,
  authController.updatePictures,
  authController.updateProfile,
);

module.exports = router;
