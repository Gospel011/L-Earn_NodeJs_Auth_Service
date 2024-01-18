const express = require("express")
const authController = require("./../controllers/authController")
const multerHandler = require('./../utils/multerHandler')


const router = express.Router()

console.log("in user routes");

//* SIGNUP ROUTE
router.put('/signup', authController.signUp)

//* LOGIN ROUTE
router.post('/login', authController.login)

//* FORGOT PASSWORD ROUTE
router.post('/forgot-password', authController.emailExists, authController.generateOTP, authController.sendMail('L-Earn Password reset email',
`Forgot your password? Use this one time password (OTP) to reset it.\nOTP: <<OTP>>`));

//* RESET PASSWORD ROUTE
router.patch('/reset-password', authController.verifyOtp, authController.resetPassword)

//* SEND EMAIL OTP ROUTE
router.post('/send-email-otp', authController.emailExists, authController.generateOTP, authController.sendMail('Verify your L-Earn account',
`Welcome to L-Earn, your gateway to a world of learning, collaboration, and skill enhancement! We are thrilled to have you on board and look forward to embarking on this educational journey together. Use this one-time-password to verify your account.\nOTP: <<OTP>>`));

//* VERIFY EMAIL ROUTE
router.post('/verify-email', authController.verifyOtp, authController.verifyEmail)

// Update profile
router.patch('/update-profile', authController.isLoggedIn, multerHandler.getProfilePicture, multerHandler.processAndUploadImageToCloud, authController.updateProfile)

module.exports = router