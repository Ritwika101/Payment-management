const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../../users/models/user');
const Payment_Req = require('../models/payment_req');
const util = require('../../../core/util');
const Ledger = require('../../ledger/models/ledger');
const Trip = require('../../trips/models/trip');

class PaymentReqHelper {
    async findLimits(req, res, next) { 
        if(util.isUndefined(req.query) || util.isUndefined(req.query.page) || (util.isUndefined(req.query.limit))){
            req.page = 1, req.limit = 5;
            req.startIndex = (req.page-1)*req.limit;
            req.endIndex = (req.page)*req.limit;
            next();
            return;
        }
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);
        req.startIndex = (page-1)*limit;
        req.endIndex = (page)*limit;
        req.page = page;
        req.limit = limit;
        
        next();

    }
    async viewRequests(req, res, next){
        try{
            const temprequests = await Payment_Req.find({status : 'created'}).sort({created_at : -1}).exec();
            let size = temprequests.length;
            let result = temprequests.slice(req.startIndex, req.endIndex);
            for(let i=0;i<result.length;i++){
                result[i].created_at = result[i]['created_at'].toLocaleDateString();
                result[i].processed_at = result[i]['processed_at'].toLocaleDateString();
            }
            const requests_list = {};
            requests_list.result = result;
            requests_list.previousPage = {};
            requests_list.nextPage= {};
            if(req.startIndex>0){
                requests_list.previousPage ={
                    page : req.page-1,
                    limit : req.limit
                }
            }
                
            if(req.endIndex<size){
                requests_list.nextPage = {
                    page : req.page+1,
                    limit : req.limit
                }
            }
            res.status(200).json({
                requests_list
            });
        }catch(error){
            console.log(error);
            res.status(400).json({
                message : 'Cannot fetch payment requests at the moment'
            });
        }
    }

    async payAmount(req, res, next){
        if(util.isUndefined(req.params.paymentreqId) || util.isUndefined(req.body) || util.isUndefined(req.body.status)){
            res.status(400).json({
                message : 'Payment request Id cannot be empty'
            });
            return;
        }
        try{
            let paymentState;
            if(req.body.status == 'success')
                paymentState = 'success';
            else
                paymentState = 'failure';

            const paymentrequest = await Payment_Req.find({_id : req.params.paymentreqId}).exec();
            let amount = 0;
            if(paymentrequest[0].status!='created'){
                res.status(400).json({
                    message : 'Cannot pay for this payment request'
                });
                return;
            }
            amount = paymentrequest[0].trip_amount + paymentrequest[0].incentive - paymentrequest[0].penalty;
            amount = Math.round(amount);
            const result = await Payment_Req.updateOne({_id : req.params.paymentreqId}, {$set : {'status' : paymentState}}).exec();
            console.log(result);

            const trips = await Trip.find({_id : paymentrequest[0].trip_id}).exec();
            const driver_assigned = trips[0].assigned_to;
            console.log(typeof driver_assigned);
            
            if(paymentState=='success'){
                const ledger = new Ledger({
                    _id : new mongoose.Types.ObjectId,
                    amount : amount,
                    user_id : driver_assigned,
                    type : 'credit'
                });
                const saved_ledger = await ledger.save();
                console.log(saved_ledger);
            }
            const io = req.app.get('socketio');
            io.emit('pay-message', `Payment ${paymentState} of Rs. ${amount} for driver id : ${driver_assigned}!`);

            res.status(200).json({
                message : 'Payment processed!'
            });

        }catch(error){
            res.status(400).json({
                message : 'Cannot process payment now'
            });
        }
    }

}

module.exports = new PaymentReqHelper();
