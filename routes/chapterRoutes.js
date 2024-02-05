const express = require('express');
const authController = require('../controllers/authController');
const chapterController = require('../controllers/chapterController');
const multer = require('../utils/multerHandler');
const HelperMiddlewares = require('../utils/helper_middlewares');

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
    chapterController.deleteChapterById,
    HelperMiddlewares.updateIds,
    HelperMiddlewares.updateChapters
  );

module.exports = router;
