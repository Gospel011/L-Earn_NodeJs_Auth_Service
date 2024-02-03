const express = require('express');
const authController = require('../controllers/authController');
const commentController = require('../controllers/commentController');

const router = express.Router({ mergeParams: true });

router.use('*', authController.isLoggedIn);


router
  .route('/')
  .post(commentController.addComment)
  .get(commentController.getAllComments)
  .patch(commentController.editComment)
//   .delete(commentController.deleteReview);

module.exports = router;