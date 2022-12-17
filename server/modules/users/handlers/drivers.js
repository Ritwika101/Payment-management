const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Trip = require('../../trips/models/trip');
const jwt = require('jsonwebtoken');
const tripHelper = require('../../trips/helpers/tripHelper');
const userHelper = require('../helpers/userHelper');
const driverHelper = require('../helpers/driverHelper');
const User = require('../models/user');
const multer = require('multer');

const storage = multer.diskStorage({
    destination : function(req,file,cb){

        cb(null, './uploads/');
    },
    filename : function(req,file,cb){
        const currDate = Date.now();
        cb(null, new Date().toISOString()+"_"+ req.userData.phone+"_"+req.params.tripId+"_"+file.originalname);
    }
});

const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/png')
        cb(null, true);
    else cb(null,true);
}

const upload = multer({
    storage:storage, 
    limits : {
    fileSize:1024*1024*5
    },
    fileFilter : fileFilter
});

router.get('/viewbookings', driverHelper.checkAuth,driverHelper.viewBookings);
router.get('/viewpastbookings', driverHelper.checkAuth, driverHelper.viewPastBookings);
router.patch('/start/:tripId', driverHelper.checkAuth,driverHelper.checkDriver, driverHelper.startTrip);
router.patch('/end/:tripId', driverHelper.checkAuth,
                            driverHelper.checkDriver, 
                            upload.single('PODImage'),
                            driverHelper.endTrip, 
                            driverHelper.submitPOD);

module.exports = router;