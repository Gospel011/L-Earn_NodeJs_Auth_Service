const express = require('express');
const authController = require('../controllers/authController');
const contentController = require('../controllers/contentController');
const multerHandler = require('../utils/multerHandler');
const ChapterRouter = require('./chapterRoutes');
const PaymentRouter = require('./paymentRoutes');
const ReviewRouter = require('./reviewRoutes.js');
const CommentRouter = require('./commentRoutes.js');

const router = express.Router();

// {{baseUrl}}/contents/:id/chapters
// {{baseUrl}}/contents/:id/reviews

router.use('/stats', PaymentRouter)
router.use('/:contentId/chapters', ChapterRouter)
router.use('/:contentId/reviews', ReviewRouter)
router.use('/:contentId/chapters/:chapterId/comments', CommentRouter)
router.use('*', authController.isLoggedIn)

router
  .route('/')
  .put(
    multerHandler.getThumbnail,
    multerHandler.processAndUploadImageToCloud('thumbnail'),
    contentController.createNewContent
  )
  .get(
      contentController.getAllContent
    )

    router
      .route('/:id')
      .get(
      contentController.getContentById
    ).patch(
      multerHandler.getThumbnail,
      multerHandler.processAndUploadImageToCloud('thumbnail'),
      contentController.editContent
      ).delete(
      contentController.deleteContentById
    );

    router.route('/info/me').get(
      contentController.getMyContents,
      contentController.getAllContent
    )

module.exports = router;
