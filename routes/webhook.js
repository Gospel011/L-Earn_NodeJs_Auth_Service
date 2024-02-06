const express = require('express')
const authController = require('../controllers/authController');
const paymentController = require('../controllers/paymentController');

const router = express.Router();

router.route('/successful-collection').post(paymentController.registerPayment);
router.route('/refund-completion').post(paymentController.registerPayment);
router.route('/disbursement').post(paymentController.registerPayment);
router.route('/settlement').post(paymentController.registerPayment);




module.exports = router;