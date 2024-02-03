const express = require('express');
const authController = require('../controllers/authController');
const reviewController = require('../controllers/reviewController');

const router = express.Router({ mergeParams: true });

router.use('*', authController.isLoggedIn);

// router
//   .route('/')
//   .post(authController.isLoggedIn, reviewController.addNewReview)
//   .get(authController.isLoggedIn, reviewController.getAllReviews)
//   .patch(authController.isLoggedIn, reviewController.editReview)
//   .delete(authController.isLoggedIn, reviewController.deleteReview);
router
  .route('/')
  .post(reviewController.addNewReview)
  .get(reviewController.getAllReviews)
  .patch(reviewController.editReview)
  .delete(reviewController.deleteReview);

// addNewReview
// getAllReviews
// editReview
// deleteReview
module.exports = router;
