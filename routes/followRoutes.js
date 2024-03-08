const authController = require('../controllers/authController');
const followController = require('../controllers/followController');
const express = require('express');
const router = express.Router({ mergeParams: true });


router.use('*', authController.isLoggedIn, authController.isEmailVerified);

router.route('/follow').post(followController.followUser)
router.route('/follow-status').get(followController.getFollowStatus)


module.exports = router;
