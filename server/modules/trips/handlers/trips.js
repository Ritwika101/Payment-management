const express = require('express');

const router = express.Router();

const mongoose = require('mongoose');

const bcrypt = require('bcrypt');

const User = require('../../users/models/user');

const userHelper = require('../../users/helpers/userHelper');

const Trip = require('../models/trip');

const tripHelper = require('../helpers/tripHelper');

const jwt = require('jsonwebtoken');



router.post('/create', tripHelper.checkAuth, tripHelper.checkAdmin, tripHelper.createTrip);

router.patch('/assign', tripHelper.checkAuth, tripHelper.checkAdmin, tripHelper.checkDriverAvailability,tripHelper.checkTripStatus, tripHelper.assignTrip);
        
router.get('/', tripHelper.checkAuth, tripHelper.checkAdmin, tripHelper.displayTrips);


module.exports = router;
