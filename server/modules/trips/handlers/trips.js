const express = require('express');
const router = express.Router();
const tripHelper = require('../helpers/tripHelper');

router.post('/create', tripHelper.checkAuth, tripHelper.checkAdmin, tripHelper.createTrip);
router.patch('/assign', tripHelper.checkAuth, tripHelper.checkAdmin, tripHelper.checkDriverAvailability,tripHelper.checkTripStatus, tripHelper.assignTrip);     
router.get('/', tripHelper.checkAuth, tripHelper.checkAdmin, tripHelper.displayTrips);

module.exports = router;
