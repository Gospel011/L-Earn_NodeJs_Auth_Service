const express = require('express');
const authController = require('../controllers/authController');
const contentController = require('../controllers/contentController');
const multerHandler = require('../utils/multerHandler');

const router = express.Router();
const rateLimit = require('express-rate-limit');
// const tutorialPostLimiter = rateLimit({
//   max: 5,
//   windowMs: 24 * 1 * 60 * 60 * 1000,
//   message: 'You\'ve created too many tutorials today, please try again tommorow',
// });

// router.use('/new', tutorialPostLimiter);

router
  .route('/')
  .put(
    authController.isLoggedIn,
    multerHandler.getThumbnail,
    multerHandler.processAndUploadImageToCloud('thumbnail'),
    contentController.createNewContent
  )
  .patch(
    authController.isLoggedIn,
    multerHandler.getThumbnail,
    multerHandler.processAndUploadImageToCloud('thumbnail'),
    contentController.editContent
    ).get(
      authController.isLoggedIn,
      contentController.getAllContent
    )

    router
      .route('/:id')
      .get(
      authController.isLoggedIn,
      contentController.getContentById
    );

module.exports = router;
