const express = require('express');

const router = express.Router();

const mongoose = require('mongoose');

const bcrypt = require('bcrypt');

const Trip = require('../../trips/models/trip');

const Rate_Card = require('../models/rate_card');

const rateCardHelper = require('../helpers/rateCardHelper')

const jwt = require('jsonwebtoken');

router.post('/create', rateCardHelper.checkAuth, rateCardHelper.checkAdmin, rateCardHelper.createRateCard);

router.get('/', rateCardHelper.checkAuth, rateCardHelper.checkAdmin, rateCardHelper.displayRateCards);

module.exports =  router;
