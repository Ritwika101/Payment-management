const express = require('express');

const router = express.Router();

const mongoose = require('mongoose');

const bcrypt = require('bcrypt');

const User = require('../../users/models/user');

const userHelper = require('../../users/helpers/userHelper');

const Trip = require('../../trips/models/trip');

const tripHelper = require('../../trips/helpers/tripHelper');

const Rate_Card = require('../models/rate_card');

const jwt = require('jsonwebtoken');

const process = require('../../../../nodemon.json');

const util = require('../../../core/util');

class rateCardHelper {
    
    async checkAuth(req,res,next){  //checks authorization while logging in
        try{
            const token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_KEY);
            req.userData = decoded;
            console.log(req.userData);
            next();
        }catch(error){
            res.status(401).json({
                message : 'Auth failed'
            });
        } 
    }
    async checkAdmin(req, res, next) {  //checks if the user is admin
        if(util.isUndefined(req.userData.role) || req.userData.role!='admin'){
            console.log('Only admins can create rate cards');
            res.status(401).json({
                messge : 'Only admins can create rate cards'
            });
            return;
        }
        else{
            next();
            return;
        }
    }

    async createRateCard(req, res, next) { //saves into db
        if(util.isUndefined(req.body)){
            res.status(400).json({
                message : 'Rate card details cannot be empty.'
            });
        }
        const rateCard = new Rate_Card({
            _id : new mongoose.Types.ObjectId,
            price : req.body.price,
            penalty : req.body.penalty,
            incentive : req.body.incentive,
        });
        try{
            const result = await rateCard.save();
            console.log(rateCard);
            res.status(201).json({
                message : 'Rate Card created',
                result : result
            });
        }catch(error){
            console.log('Error in creating rate card : ', error);
            res.status(400).json({
                message : error
            });
        }
    }

    async displayRateCards(req, res,next) {
        try{
            const result = await Rate_Card.find().exec();
            res.status(200).json({result});
        }catch(error){
            res.status(400).json({
                message:error
            });
        }
    }

}
module.exports = new rateCardHelper();
