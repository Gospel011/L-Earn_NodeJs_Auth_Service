const express = require('express');
const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');

const router = express.Router({ mergeParams: true });

router.use('*', authController.isLoggedIn);


router
  .route('/')
  .post(reviewController.addNewReview, reviewController.updateContentReviewCount)
  .get(reviewController.getAllReviews)
  .patch(reviewController.editReview, reviewController.updateContentReviewCount)
  .delete(reviewController.deleteReview, reviewController.updateContentReviewCount);

module.exports = router;
