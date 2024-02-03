const express = require('express');
const authController = require('../controllers/authController');
const chapterController = require('../controllers/chapterController');
const multer = require('../utils/multerHandler');


const router = express.Router({ mergeParams: true });

//* CREATE BOOK, GET BOOK, UPDATE BOOK, DELETE BOOK

router.route('/').put(
  authController.isLoggedIn,
  multer.getVideo,
  multer.processAndUploadImageToCloud('video'),
  chapterController.createNewChapter
)

router.route('/:chapterId/chapter/:chapter')
  .patch(
  authController.isLoggedIn,
  multer.getVideo,
  multer.processAndUploadImageToCloud('video'),
  chapterController.editChapter
);

module.exports = router;
