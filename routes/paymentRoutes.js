const express = require('express');
const authController = require('../controllers/authController');
const paymentController = require('../controllers/paymentController');
const router = express.Router();

router.use('*', authController.isLoggedIn, authController.isEmailVerified);


router.route('/:contentId').post(paymentController.initializeInvoice);

router.route('/').get(paymentController.getCoursePaymentsStatistics);
router.route('/transactionHistory').get(paymentController.getTransactionHistory);

module.exports = router;