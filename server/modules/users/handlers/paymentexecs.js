const express = require('express');
const router = express.Router();
const paymentexecHelper = require('../helpers/paymentexecHelper');

router.get('/viewPODs', paymentexecHelper.checkAuth, paymentexecHelper.checkExec, paymentexecHelper.viewPODs);
router.patch('/approve/:podId', paymentexecHelper.checkAuth, paymentexecHelper.checkExec, paymentexecHelper.findPOD, paymentexecHelper.approvePOD);
router.patch('/reject/:podId', paymentexecHelper.checkAuth, paymentexecHelper.checkExec, paymentexecHelper.findPOD, paymentexecHelper.rejectPOD);

module.exports = router;

