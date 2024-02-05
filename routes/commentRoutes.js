const express = require('express');
const authController = require('../controllers/authController');
const commentController = require('../controllers/commentController');
const HelperMiddlewares = require('../utils/helper_middlewares');
const replyRouter = require('./replyRoutes');

const router = express.Router({ mergeParams: true });

router.use('/:commentId/replies', replyRouter);
router.use('*', authController.isLoggedIn);

router
  .route('/')
  .post(commentController.addComment)
  .get(commentController.getAllComments);

router
  .route('/:commentId')
  .patch(commentController.editComment)
  .delete(commentController.deleteComment, HelperMiddlewares.updateIds);

router.route('/:commentId/like').post(commentController.likeComment);
router.route('/:commentId/unlike').post(commentController.unlikeComment);

module.exports = router;
