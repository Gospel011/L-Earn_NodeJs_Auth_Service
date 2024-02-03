const express = require('express');
const authController = require('../controllers/authController');
const contentController = require('../controllers/contentController');
const multerHandler = require('../utils/multerHandler');
const ChapterRouter = require('./chapterRoutes');
const ReviewRouter = require('./reviewRoutes.js');

const router = express.Router();

// {{baseUrl}}/contents/:id/chapters
// {{baseUrl}}/contents/:id/reviews

router.use('/:contentId/chapters', ChapterRouter)
router.use('/:contentId/reviews', ReviewRouter)

router
  .route('/')
  .put(
    authController.isLoggedIn,
    multerHandler.getThumbnail,
    multerHandler.processAndUploadImageToCloud('thumbnail'),
    contentController.createNewContent
  )
  .get(
      authController.isLoggedIn,
      contentController.getAllContent
    )

    router
      .route('/:id')
      .get(
      authController.isLoggedIn,
      contentController.getContentById
    ).patch(
      authController.isLoggedIn,
      multerHandler.getThumbnail,
      multerHandler.processAndUploadImageToCloud('thumbnail'),
      contentController.editContent
      ).delete(
      authController.isLoggedIn,
      contentController.deleteContentById
    );

    router.route('/info/me').get(
      authController.isLoggedIn,
      contentController.getMyContents,
      contentController.getAllContent
    )

module.exports = router;
