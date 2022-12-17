const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Trip = require('../../trips/models/trip');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const tripHelper = require('../../trips/helpers/tripHelper');
const userHelper = require('../helpers/userHelper');
const driverHelper = require('../helpers/driverHelper');
const paymentexecHelper = require('../helpers/paymentexecHelper');

router.get('/viewPODs', paymentexecHelper.checkAuth, paymentexecHelper.checkExec, paymentexecHelper.viewPODs);
router.patch('/approve/:podId', paymentexecHelper.checkAuth, paymentexecHelper.checkExec, paymentexecHelper.findPOD, paymentexecHelper.approvePOD);
router.patch('/reject/:podId', paymentexecHelper.checkAuth, paymentexecHelper.checkExec, paymentexecHelper.findPOD, paymentexecHelper.rejectPOD);

module.exports = router;

