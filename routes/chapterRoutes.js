const express = require('express');
const authController = require('../controllers/authController');
const chapterController = require('../controllers/chapterController');
const multer = require('../utils/multerHandler');

const router = express.Router({ mergeParams: true });

//* CREATE BOOK, GET BOOK, UPDATE BOOK, DELETE BOOK

// router.use('/:contentId/chapters', ChapterRouter)

router.use('*', authController.isLoggedIn)

router
  .route('/')
  .put(
    multer.getVideo,
    multer.processAndUploadImageToCloud('video'),
    chapterController.createNewChapter
  )
  .get(
    chapterController.getChapters);

router
  .route('/:chapterId')
  .patch(
    chapterController.editChapter
  ).get(
    chapterController.getChapterById
  ).delete(
    chapterController.deleteChapterById
  );

module.exports = router;
