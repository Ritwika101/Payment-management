const express = require('express');
const router = express.Router();
const userHelper = require('../../users/helpers/userHelper');
const payment_reqHelper = require('../helpers/payment_reqHelper');


router.get('/viewRequests', userHelper.checkAuth, userHelper.checkAdmin, payment_reqHelper.findLimits, payment_reqHelper.viewRequests);
router.post('/pay/:paymentreqId', userHelper.checkAuth, userHelper.checkAdmin, payment_reqHelper.payAmount);

module.exports = router;