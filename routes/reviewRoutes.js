const express = require('express');
const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');


const router = express.Router({ mergeParams: true });

router.route('/').post(
    authController.isLoggedIn,
    reviewController.addNewReview
)

module.exports = router;