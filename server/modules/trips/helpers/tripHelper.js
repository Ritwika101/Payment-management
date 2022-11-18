const express = require('express');

const router = express.Router();

const mongoose = require('mongoose');

const bcrypt = require('bcrypt');

const User = require('../../users/models/user');

const Trip = require('../models/trip');

const jwt = require('jsonwebtoken');

const process = require('../../../../nodemon.json');

const util = require('../../../core/util');

class TripHelper {
    async checkAuth(req,res,next){  //checks authorization while logging in
        try{
            const token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_KEY);
            req.userData = decoded;
            console.log(req.userData);
            next();
        }catch(error){
            res.status(401).json({
                message : 'Authorization failed'
            });
        } 
    }
    async checkAdmin(req, res, next) {  //checks if the user is admin
        if(util.isUndefined(req.userData.role) || req.userData.role!='admin'){
            console.log('Only admins can create/update trips');
            res.status(400).json({
                messge : 'Only admins can create/update trips'
            });
            return;
        }
        else{
            console.log('Admin success');
            next();
            return;
        }
    }
    
    async createTrip(req, res, next) { //saves into db
        const temp_start_time = new Date(req.body.start_time);
        const temp = Date.now();
        const temp_curr_date = new Date(temp);
        if(temp_start_time < temp_curr_date){
            res.status(400).json({
                message : 'Cannot create a past trip.'
            });
            return;
        }
        const trip = new Trip({
            _id : new mongoose.Types.ObjectId,
            status : 'created',
            start_time : req.body.start_time,
            total_kms : req.body.total_kms,
            rate_card : req.body.rate_card,
        });
        try{
            const result = await trip.save();
            console.log(trip);
            res.status(201).json({
                message : 'Trip created',
                result : result
            });
        }catch(error){
            console.log('Error in creating trip : ', error);
            res.status(400).json({
                message : error
            });
        }
    }
    
    async checkDriverAvailability (req, res, next) {
        if(util.isUndefined(req.body.tripId) || util.isUndefined(req.body.driverNum)){
            res.status(400).json({
                message : "Trip Id and the driver phone number cannot be empty."
            });
            return;
        }
        const tripId = req.body.tripId;
        const driverNum = req.body.driverNum;
        console.log(tripId, driverNum);
        const updateOps = {};
        try{
            const drivers = await User.find({phone:driverNum, role:'driver'}).exec();
            console.log(drivers);
            if(drivers.length<1) {
                res.status(404).json({
                    message:'No drivers matching'
                });
                return;
            }
            else{
                try{
                    const bookings = await Trip.find({assigned_to:drivers[0]._id, status:'assigned'}).exec();
                    if(bookings.length<1){
                        req.driverData = drivers[0];
                        console.log(req.driverData);
                        next();
                    }
                    else{
                        let trip_to_assign;
                        try{
                            trip_to_assign = await Trip.findById(tripId).exec();
                            console.log(trip_to_assign);
                        }catch(error){
                            res.status(404).json({
                                error:'Trip not found'
                            });
                            return;
                        }
                        let i = 0;
                        for(i=0;i<bookings.length;i++){
                            const tripdate = bookings[i].start_time;
                            console.log(tripdate);
                            console.log(bookings[i].start_time.toLocaleDateString());
                            console.log(trip_to_assign.start_time.toLocaleDateString());
                            if(tripdate.toLocaleDateString() == trip_to_assign.start_time.toLocaleDateString()){
                                break;
                            }
                        }
                        if(i==bookings.length){
                            req.driverData = drivers[0];
                            console.log(req.driverData);
                            next();  
                        }
                        else{
                            res.status(400).json({
                                message : 'Driver found but is not free to take the trip on this day'
                            }); 
                            return;
                        }
                    }
                    
                }catch(error){
                    res.status(400).json({
                        message : 'Driver cannot be assigned at the moment'
                    }); 
                }   
            }  
    
        }catch(error){
            console.log(error);
            res.status(400).json({
                message:'Driver can\'t be assigned'
            });
        }
    
    }
    
    async checkTripStatus(req, res, next) {
        if(util.isUndefined(req.body.tripId)){
            res.status(400).json({
                message : "Trip Id cannot be empty."
            });
            return;
        }
        try{
            const result = await Trip.findById(req.body.tripId);
            if(result.status!= 'created'){
                console.log('Trip already assigned to someone');
                res.status(400).json({
                    message : 'This trip is already assigned to someone'
                });
            }
            else{
                next();
            }
        }catch(error) {
            console.log(error);
            res.status(400).json({
                message : error
            })
        }
    }
    
    async assignTrip(req, res, next){
        if(util.isUndefined(req.driverData)){
            res.status(400).json({
                message : "Driver data is undefined."
            });
            return;
        }
        const updateOps = {};
        updateOps.assigned_to = req.driverData._id;
        updateOps.updated_at = Date.now();
        updateOps.status = 'assigned';
        try{
            console.log(req.body.tripId);
            const result = await Trip.updateOne({_id : req.body.tripId}, {$set : updateOps}); //WITHOUT EXEC
            console.log("result : ",result);
            res.status(201).json({
                message : 'Trip assigned to driver'
            });
    
        }catch(error){
            console.log(error);
            res.status(400).json({
                message : 'Trip couldn\'t be assigned'
            });
        }
    }
    
    async displayTrips(req, res,next) {
        try{
            let result = await Trip.find().sort({start_time:1}).exec();
            let docs = [];
            for(let i=0;i<result.length;i++){
                let doc = {};
                doc['date'] = result[i].start_time.toLocaleDateString();
                doc['time'] = result[i].start_time.toLocaleTimeString();
                doc['_id'] = result[i]._id;
                doc['status'] = result[i].status;
                doc['rate_card'] = result[i].rate_card;
                doc['total_kms'] = result[i].total_kms;
                if(result[i].assigned_to!=null) 
                    doc['assigned_to'] = result[i].assigned_to;
                docs.push(doc);
            }
            console.log(docs);
            res.status(200).json({docs});
        }catch(error){
            res.status(400).json({
                message:error
            });
        }
    }
    
}

module.exports = new TripHelper();