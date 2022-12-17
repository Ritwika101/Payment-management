const express = require('express');
const router = express.Router();
const userHelper = require('../../users/helpers/userHelper');
const ledgerHelper = require('../helpers/ledgerHelper');
const driverHelper = require('../../users/helpers/driverHelper');

router.get('/', userHelper.checkAuth, userHelper.checkAdmin, ledgerHelper.findLimits, ledgerHelper.displayLedgers);
router.get('/viewLedger', userHelper.checkAuth, driverHelper.checkDriver, ledgerHelper.findLimits,ledgerHelper.getLedger);

module.exports = router;