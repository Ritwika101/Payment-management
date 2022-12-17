const express = require('express');
const router = express.Router();
const rateCardHelper = require('../helpers/rateCardHelper')

router.post('/create', rateCardHelper.checkAuth, rateCardHelper.checkAdmin, rateCardHelper.createRateCard);
router.get('/', rateCardHelper.checkAuth, rateCardHelper.checkAdmin, rateCardHelper.displayRateCards);

module.exports =  router;
