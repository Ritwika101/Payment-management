const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../../users/models/user');
const Payment_Req = require('../models/payment_req');
const userHelper = require('../../users/helpers/userHelper');
const payment_reqHelper = require('../helpers/payment_reqHelper');
const jwt = require('jsonwebtoken');
const util = require('../../../core/util');
const Ledger = require('../../ledger/models/ledger');
const Trip = require('../../trips/models/trip');

router.get('/viewRequests', userHelper.checkAuth, userHelper.checkAdmin, payment_reqHelper.findLimits, payment_reqHelper.viewRequests);
router.post('/pay/:paymentreqId', userHelper.checkAuth, userHelper.checkAdmin, payment_reqHelper.payAmount);

module.exports = router;