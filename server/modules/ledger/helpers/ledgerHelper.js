const express = require('express');

const router = express.Router();

const mongoose = require('mongoose');

const bcrypt = require('bcrypt');

const User = require('../../users/models/user');

const Ledger = require('../models/ledger');

const Trip = require('../../trips/models/trip');

const userHelper = require('../../users/helpers/userHelper');

const jwt = require('jsonwebtoken');

const util = require('../../../core/util');



class LedgerHelper {
    async findLimits(req, res, next) { 
        if(util.isUndefined(req.query) || util.isUndefined(req.query.page) || (util.isUndefined(req.query.limit))){
           req.page=1;
           req.limit=5;
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
    async displayLedgers(req, res, next){
        try{
            const templedgers = await Ledger.find().sort({date : -1});
            let size = templedgers.length;
            let result = templedgers.slice(req.startIndex, req.endIndex);
            console.log(result.length);
            for(let i=0;i<result.length;i++){
                result[i].date = result[i]['date'].toLocaleDateString();
            }
            const ledger_list = {};
            ledger_list.result = result;
            ledger_list.previousPage = {};
            ledger_list.nextPage= {};
            if(req.startIndex>0){
                ledger_list.previousPage ={
                    page : req.page-1,
                    limit : req.limit
                }
            }
                
            if(req.endIndex<size){
                ledger_list.nextPage = {
                    page : req.page+1,
                    limit : req.limit
                }
            }
            res.status(200).json({
                ledger_list
            });
        }catch(error){
            console.log(error);
            res.status(400).json({
                message : 'Cannot fetch ledgers at the moment'
            });
        }
    }

    async getLedger(req, res, next){
        try{
            const templedgers = await Ledger.find({user_id : req.userData._id}).sort({date : -1}).exec();
            let size = templedgers.length;
            let result = templedgers.slice(req.startIndex, req.endIndex);
            console.log(result.length);
            for(let i=0;i<result.length;i++){
                result[i].date = result[i]['date'].toLocaleDateString();
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
                message : 'Cannot fetch ledgers at the moment'
            });
        }
    }

}

module.exports = new LedgerHelper();
