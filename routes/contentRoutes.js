const express = require('express');
const authController = require('../controllers/authController');
const contentController = require('../controllers/contentController');
const multerHandler = require('../utils/multerHandler');
const ChapterRouter = require('./chapterRoutes');

const router = express.Router();

// {{baseUrl}}/contents/:id/chapters

router.use('/:contentId/chapters', ChapterRouter)

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
