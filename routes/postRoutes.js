const express = require('express');
const authController = require('../controllers/authController');
const multer = require('../utils/multerHandler');
const AppError = require('../utils/appError');

const router = express.Router()


router.use('*', authController.isLoggedIn, (req, res, next) => {
    console.log(`Is email verified = ${req.user.emailVerified}`);
    if  (req.user.emailVerified){
        next();
    } else {
        
        return next(new AppError("Please verify your email to be able to post content"))
    }
})


router.route('/').put((req, res, next) => {
    res.status(200).json({
        status: "success"
    })
})






module.exports = router;