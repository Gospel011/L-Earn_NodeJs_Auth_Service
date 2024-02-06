const express = require('express');
const authController = require('../controllers/authController');
const postController = require('../controllers/postController');
const multer = require('../utils/multerHandler');
const commentRoutes = require('./commentRoutes');

const router = express.Router()


router.use('*', authController.isLoggedIn, authController.isEmailVerified)
router.use('/:postId/comments', commentRoutes)


router.route('/').put( multer.getImage, multer.processAndUploadImageToCloud('image'), postController.createPost).get(postController.getPosts);

router.route('/:pollId/vote/:optionId').post(postController.vote)

router.route('/:postId').delete(postController.deletePost);
router.route('/:postId/like').post(postController.likePost);
router.route('/:postId/unlike').post(postController.unlikePost);







module.exports = router;