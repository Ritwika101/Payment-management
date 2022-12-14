const express = require('express');
const router = express.Router();
const driverRoutes = require('./drivers');
const paymentexecRoutes = require('./paymentexecs');
const userHelper = require('../helpers/userHelper');

router.use('/driver', driverRoutes);
router.use('/paymentexec',paymentexecRoutes);
router.post('/signupAdmin',userHelper.checkEmail,userHelper.createUserAdmin, userHelper.createUserAdminHelper);
router.post('/login', userHelper.findUser, userHelper.loginUser);
router.post('/create', userHelper.checkAuth, userHelper.checkAdmin, userHelper.checkEmail, userHelper.createUser, userHelper.createUserHelper);
router.delete('/:userId', userHelper.checkAuth, userHelper.checkAdmin, userHelper.deleteUser);  
router.post('/logout', (req,res,next) => {
    req.userData = undefined;
    req.headers.authorization = 'Bearer ';
    res.status(200).json({
        message : 'Logged out'
    })
});
router.get('/', userHelper.checkAuth, userHelper.checkAdmin,userHelper.findLimits, userHelper.displayUsers);

module.exports = router;


