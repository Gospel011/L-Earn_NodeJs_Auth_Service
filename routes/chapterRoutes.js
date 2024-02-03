const express = require('express');
const authController = require('../controllers/authController');
const chapterController = require('../controllers/chapterController');
const multer = require('../utils/multerHandler');

const router = express.Router({ mergeParams: true });

//* CREATE BOOK, GET BOOK, UPDATE BOOK, DELETE BOOK

// router.use('/:contentId/chapters', ChapterRouter)


router
  .route('/')
  .put(
    authController.isLoggedIn,
    multer.getVideo,
    multer.processAndUploadImageToCloud('video'),
    chapterController.createNewChapter
  )
  .get(
    authController.isLoggedIn,
    chapterController.getChapters);

router
  .route('/:chapterId')
  .patch(
    authController.isLoggedIn,
    chapterController.editChapter
  ).get(
    authController.isLoggedIn,
    chapterController.getChapterById
  ).delete(
    authController.isLoggedIn,
    chapterController.deleteChapterById
  );

module.exports = router;
