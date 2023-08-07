const express = require('express');
const { processPayment, sendStripeApi } = require('../controllers/paymentController');
const { isAuthenticatedUser } = require('../middlewares/authenticate');
const { orders, verfiy } = require('../controllers/razerpayController');
const router = express.Router();

router.route('/payment/process').post( isAuthenticatedUser, processPayment);
router.route('/stripeapi').get( isAuthenticatedUser, sendStripeApi);

router.route('/order').post(orders)
router.route('/verify').post(verfiy)


module.exports = router;

