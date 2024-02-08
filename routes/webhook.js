const express = require('express')
const authController = require('../controllers/authController');
const webhookController = require('../controllers/webhookController');

const router = express.Router();

router.route('/successful-collection').post(webhookController.registerPayment);
router.route('/refund-completion').post(webhookController.registerPayment);
router.route('/disbursement').post(webhookController.registerPayment);
router.route('/settlement').post(webhookController.registerPayment);




module.exports = router;