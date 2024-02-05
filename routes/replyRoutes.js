const express = require('express');
const authController = require('../controllers/authController');
const replyController = require('../controllers/replyController');
// const HelperMiddlewares = require('../utils/helper_middlewares');

const router = express.Router({ mergeParams: true });

router.use('*', authController.isLoggedIn);

router
  .route('/')
  .post(replyController.replyComment)
  .get(replyController.getAllReplies);

router
  .route('/:replyId')
  .patch(replyController.editReply)
  .delete(replyController.deleteReply);

router.route('/:replyId/like').post(replyController.likeReply);
router.route('/:replyId/unlike').post(replyController.unlikeReply);

module.exports = router;
