const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../../users/models/user');
const userHelper = require('../../users/helpers/userHelper');
const ledgerHelper = require('../helpers/ledgerHelper');
const jwt = require('jsonwebtoken');
const util = require('../../../core/util');
const Ledger = require('../../ledger/models/ledger');
const driverHelper = require('../../users/helpers/driverHelper');

router.get('/', userHelper.checkAuth, userHelper.checkAdmin, ledgerHelper.findLimits, ledgerHelper.displayLedgers);
router.get('/viewLedger', userHelper.checkAuth, driverHelper.checkDriver, ledgerHelper.findLimits,ledgerHelper.getLedger);

module.exports = router;