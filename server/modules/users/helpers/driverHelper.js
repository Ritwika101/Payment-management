const express = require('express');

const router = express.Router();

const mongoose = require('mongoose');

const bcrypt = require('bcrypt');

const Trip = require('../../trips/models/trip');

const Rate_Card = require('../../ratecards/models/rate_card');

const rateCardHelper = require('../../ratecards/helpers/rateCardHelper')

const jwt = require('jsonwebtoken');

const moment = require('moment');

const process = require('../../../../nodemon.json');

const Pod = require('../../pod/models/pod');

const User = require('../models/user');

const util = require('../../../core/util');

class DriverHelper{
    async checkAuth(req,res,next){  //checks authorization while logging in
        if(util.isUndefined(req.headers.authorization)){
            res.status(401).json({
                message : 'Authorization failed'
            });
            return;
        }
        const token = req.headers.authorization.split(" ")[1];
        console.log(token);
        try{
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
    
    async checkDriver(req, res, next) {  //checks if the user is admin
        if(util.isUndefined(req.userData.role) || req.userData.role!= 'driver'){
            res.status(400).json({
                messge : 'Only drivers can start/end trips'
            });
            return;
        }
        else{
            next();
            return;
        }
    }
    
    async viewBookings (req,res,next) { 
        try{
            if(util.isUndefined(req.userData)){
                res.status(401).json({
                    messge : 'Authorization failed'
                });
                return;            
            }
            console.log(req.userData);
            let result = await Trip.find({assigned_to:req.userData._id, status :{$in :['assigned', 'in_progress']}}).sort({start_time:1}).exec();
            let docs = [];
            for(let i=0;i<result.length;i++){
                let doc = {};
                doc['date'] = result[i].start_time.toLocaleDateString();
                doc['time'] = result[i].start_time.toLocaleTimeString();
                doc['_id'] = result[i]._id;
                doc['status'] = result[i].status;
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

    async viewPastBookings (req,res,next) { 
        try{
            if(util.isUndefined(req.userData)){
                res.status(401).json({
                    messge : 'Authorization failed'
                });
                return;            
            }
            console.log(req.userData);
            let result = await Trip.find({assigned_to:req.userData._id, status:'completed'}).sort({start_time:1}).exec();
            let docs = [];
            for(let i=0;i<result.length;i++){
                let doc = {};
                doc['date'] = result[i].start_time.toLocaleDateString();
                doc['time'] = result[i].start_time.toLocaleTimeString();
                doc['_id'] = result[i]._id;
                doc['status'] = result[i].status;
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
    
    async startTrip(req, res, next) {
        if( ( util.isUndefined(req.params)) || (util.isUndefined(req.params.tripId, 1))){
            res.status(400).json({
                messge : 'Please mention a trip id to start a trip'
            });
            return;
        }
        const tripId = req.params.tripId;
        //console.log("TYPE", typeof tripId);
        const buffer = 1000*60*60;//1 hour buffer in milliseconds
        console.log(tripId);
        console.log(req.userData);
        try{
            const totalTrips = await Trip.find({_id:tripId}).exec();
            const tripFound = totalTrips[0];
            console.log(tripFound);
            const x = Date.now();
            const currentEpoch = x+buffer;
            const currentDate = new Date(currentEpoch).toLocaleDateString();
            const currentTime = new Date(currentEpoch).toLocaleTimeString();
            console.log(currentDate, currentTime, currentEpoch);
            console.log(tripFound.start_time.toLocaleDateString(), tripFound.start_time.toLocaleTimeString(), tripFound.start_time.getTime());
            console.log(tripFound);
            if(tripFound.status!= 'assigned' || tripFound.assigned_to!=req.userData._id) {
                res.status(400).json({
                    message:'Cannot start this trip'
                })
                return;
            } 
            
            else if(currentEpoch<tripFound.start_time.getTime()){
                res.status(400).json({
                    message:'You can start the trip only within an hour before the start time, or after the start time.',
                    trip_start_date : tripFound.start_time.toLocaleDateString(),
                    trip_start_time : tripFound.start_time.toLocaleTimeString(),
                })
                return;
            }
            try{
                const driverInOtherTrips = await Trip.find({assigned_to : req.userData._id, status:'in_progress'});
                if(driverInOtherTrips.length>=1){
                    res.status(400).json({
                        message:'Cannot start this trip, because you are already in another trip'
                    })
                    return;
                }
            }catch(error){
                res.status(400).json({
                    error:error,
                    message : 'Couldn\'t search for the driver\'s trips'
                });
            }
            const updateOps = {};
            updateOps.actual_start_time = new Date(x);
            updateOps.status = 'in_progress';
            updateOps.updated_at = new Date(x);
            try{
                const result = await Trip.updateOne({_id:tripId}, {$set : updateOps}).exec();
                console.log(result);
                res.status(200).json({
                    message : 'Trip started!'
                });
            }catch(error){
                res.status(400).json({
                    error:error,
                    message : 'Couldn\'t update/start trip'
                });
            }
            
        }catch(error){
            res.status(404).json({
                message:'Trip not found'
            });
        }
    }
    
    async endTrip(req, res, next){
        if( ( util.isUndefined(req.params)) || ( util.isUndefined(req.params.tripId, 1))){
            res.status(400).json({
                messge : 'Trip Id and total kilometers driven cannot be empty'
            });
            return;
        }
        const tripId = req.params.tripId;
        const kms = req.body.kms;
        const x = Date.now();
        console.log(kms,tripId);
        try{
            const tripFound = await Trip.findById(tripId).exec();
            console.log(tripFound);
            if(tripFound.status!= 'in_progress' || tripFound.assigned_to!=req.userData._id) {
                res.status(400).json({
                    message:'Cannot end this trip'
                })
                return;
            }
            const updateOps = {};
            updateOps.status = 'completed';
            updateOps.updated_at = new Date(x);
            updateOps.actual_kms = kms; 
            try{
                const result = await Trip.updateOne({_id : tripId}, {$set : updateOps}).exec();
                console.log(result);
                next();
    
            }catch(error){
                res.status(400).json({
                    message:'Could not update the details'
                });
            }
        }catch(error){
            res.status(404).json({
                message:'Trip not found'
            });
        }
    }
    
    async submitPOD(req, res, next) {
        try{
            if(util.isUndefined(req.file.path)){
                res.status(400).json({
                    messge : 'Cannot proceed without attaching the POD'
                });
                return;
            }
            const podDoc = new Pod({
                _id : new mongoose.Types.ObjectId,
                trip_id : req.params.tripId,
                status:'created',
                pod:req.file.path
            });
            const result = await podDoc.save();
            res.status(200).json({
                message:'POD Uploaded!'
            });
        }catch(error){
            res.status(400).json({
                error:error,
                message:'Error in uploading POD'
            });
        }
        
    }
    
}


module.exports= new DriverHelper();