const express = require('express');

const router = express.Router();

const mongoose = require('mongoose');

const bcrypt = require('bcrypt');

const Trip = require('../../trips/models/trip');

const User = require('../models/user');

const Rate_Card = require('../../ratecards/models/rate_card');

const rateCardHelper = require('../../ratecards/helpers/rateCardHelper')

const jwt = require('jsonwebtoken');

const moment = require('moment');

const process = require('../../../../nodemon.json');

const Pod = require('../../pod/models/pod');

const util = require('../../../core/util');

class PaymentexecHelper {
    
    async checkAuth(req, res, next) {
        if(util.isUndefined(req.headers.authorization)){
            res.status(401).json({
                message : 'Authorization failed'
            });
            return;
        }
        const token = req.headers.authorization.split(" ")[1];
        try{
            const decoded = jwt.verify(token, process.env.JWT_KEY);
            //console.log(token);
            req.userData = decoded;
            next();
        }catch(error){
            console.log(error);
            res.status(401).json({
                message : 'Authorization failed'
            })
        }
    }

    async checkExec(req, res, next){
        if(util.isUndefined(req.userData) || util.isUndefined(req.userData.role)){
            res.status(401).json({
                message : 'User role cannot be empty'
            });
            return;
        }
        const role = req.userData.role;
        try{
            if(role=='payment_exec'){
                console.log('Payment executive success');
                next();
                return;
            }
            else{
                res.status(401).json({
                    message : 'User doesn\'t have Payment executive permissions'
                });
                return;
            }

        }catch(error){
            res.status(401).json({
                message : 'Authorization failed'
            });
            return;
        }
    }

    async viewPODs(req, res, next) {
        try{
            const result = await Pod.find({status:'created'}).exec();
            let docs = [];
            if(result.length<1){
                res.status(200).json({
                    message : 'No pending PODs found'
                });
                return;
            }
            for(let i=0;i<result.length;i++){
                let doc = {};
                doc['_id'] = result[i]._id;
                doc['status'] = result[i].status;
                doc['trip_id'] = result[i].trip_id;
                doc['pod'] = result[i].pod;

                docs.push(doc);
            }
            res.status(200).json({
                POD_List : docs
            });
            return;

        }catch(error){
            res.status(400).json({
                message : 'No PODs found'
            })
        }
    }

    async findPOD(req, res, next){
        if(util.isUndefined(req.params.podId)){
            res.status(400).json({
                message : 'You need to provide a POD Id'
            });
            return;
        }
        try{
            const result = await Pod.find({_id : req.params.podId, status : 'created'}).exec();
            console.log(result);
            if(result.length<1){
                res.status(400).json({
                    message : 'POD either not found in the database, or is already approved/rejected'
                });
                return;
            }
            req.podData = result[0];
            console.log(result);
            next();
        }catch(error){
            res.status(400).json({
                message :error
            });
            return;
        }
    }

    async approvePOD(req, res, next){
        if(util.isUndefined(req.params.podId)){
            res.status(400).json({
                message : 'You need to provide a POD Id'
            });
            return;
        }
        try{
            const updateOps = {};
            updateOps.status = 'approved';
            const result = await Pod.updateOne({_id : req.params.podId, status : 'created'}, {$set : updateOps}).exec();
            console.log(result);
            res.status(200).json({
                message : 'Approved the POD!'
            });
            return;
        }catch(error){
            console.log(error);
            res.status(400).json({
                message : 'Error in approving POD'
            });
            return;
        }
    }

    async rejectPOD(req, res, next){
        if(util.isUndefined(req.params.podId)){
            res.status(400).json({
                message : 'You need to provide a POD Id'
            });
            return;
        }
        try{
            let updateOps = {};
            updateOps['status'] = 'rejected';
            const result = await Pod.updateOne({_id : req.params.podId, status : 'created'}, {$set : updateOps}).exec();
            console.log(result);
            res.status(400).json({
                message : 'Rejected the POD!'
            });
            return;
        }catch(error){
            console.log(error);
            res.status(400).json({
                message : 'Error in rejecting POD'
            });
            return;
        }
    }
    
}

module.exports = new PaymentexecHelper();
