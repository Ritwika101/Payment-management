
const express = require('express');

const router = express.Router();

const mongoose = require('mongoose');

const bcrypt = require('bcrypt');

const User = require('../models/user');

const jwt = require('jsonwebtoken');

const util = require('../../../core/util');

const process = require('../../../../nodemon.json');

const userErrors = require('../../../core/appData');

class UserHelper {
    async checkEmail(req, res, next) {  //checks if email id already exists
        if(util.isUndefined(req.body.email)){
            res.status(400).json({
                message : 'Email cannot be empty'
            });
            return;
        }
        const arr = await User.find({email : req.body.email}).exec();
        if(arr.length <1 ){
            next();
            return;
        } 
        else {
            res.status(401).json({
                message : 'Authorization failed'
            });
            return;
        }      
    }
    
    
    async findUser(req, res, next) { //checks if user exists
        if(util.isUndefined(req.body.email) || util.isUndefined(req.body.password)){
            res.status(400).json({
                message : 'Email and password cannot be empty'
            });
            return;
        }
        const arr = await User.find({email : req.body.email}).exec();
        console.log("STATUS",arr.ok);
        if(arr.length <1 ){
            res.status(401).json({
                message : 'Authorization failed'
            });
            return;
        } 
        else {
            req.userData = arr[0]; //storing user data in the request
            console.log(req.userData);
            next();
        }
            
    }
    
    async checkAuth(req,res,next){  //checks authorization while logging in
        if(util.isUndefined(req.headers.authorization)){
            res.status(401).json({
                message : 'Authorization failed'
            });
            return;
        }
        const token = req.headers.authorization.split(" ")[1];
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
    
    async checkAdmin(req, res, next) {  //checks if the user is admin
        if(util.isUndefined(req.userData.role) || req.userData.role!= 'admin' ){ 
            console.log('User doesn\'t have Admin permissions');
            res.status(400).json({
                messge : 'User doesn\'t have Admin permissions'
            });
            return;
        }
        else{
            next();
            return;
        }
    }
    
    async createUserAdmin(req, res, next) { //saves into db
        if(util.isUndefined(req.body)|| (req.body.role!= 'admin') || (req.headers.bypass!= 'secret')){
            console.log('Only admins can signup');
            res.status(401).json({
                message : 'Only admins can signup'
            });
            return;
        }
        else{
            bcrypt.hash(req.body.password, 10, (err, hash)=>{
                if(err){
                    console.log('Error in storing password : ', err);
                    res.status(400).json({
                        message : err
                    });
                    return;
                }else{
                    const user = new User({
                        _id : new mongoose.Types.ObjectId,
                        email : req.body.email,
                        password : hash,
                        name : req.body.name,
                        phone: req.body.phone,
                        active : req.body.active,
                        created_at : req.body.created_at,
                        updated_at : req.body.updated_at,
                        role : req.body.role
                    });
                    req.saveData = user;
                    next();
                }
            });
        }
        
    }
    
    async createUserAdminHelper (req,res,next){
        try{
            const user = req.saveData;
            const result = await user.save();
            console.log(user);
            res.status(201).json({
                message : 'User created',
                result : result
            });
        }catch(error){
            console.log('Error in creating user : ', error);
            res.status(400).json({
                message : error
            });
        }
    }
    
    async loginUser(req, res, next) {
        if(util.isUndefined(req.body.password) || util.isUndefined(req.body.email)){
            res.status(400).json({
                message : 'Email and password are required to login'
            })
            return;
        }
        bcrypt.compare(req.body.password,req.userData.password,(err, result) => {
            if(err){
                res.status(401).json({
                    message : 'Authorization failed'
                });
                return;
            }
            if(result){
                const token = jwt.sign(
                    {
                        _id : req.userData._id,
                        email : req.userData.email,
                        name : req.userData.name,
                        phone : req.userData.phone,
                        role : req.userData.role
                    },
                    process.env.JWT_KEY,
                    {
                        expiresIn :"1hr"
                    }
                );
                console.log(token);
                res.status(200).json({
                    message : 'Authorization successful! User logged in',
                    token : token
                });
                return;
            }
            res.status(401).json({
                message : 'Authorization failed'
            });
            return;
        });
    }
    

    async createUser(req, res, next) {
        if(util.isUndefined(req.body)){
            res.status(400).json({
                message : "User details cannot be empty"
            });
            return;
        }
        bcrypt.hash(req.body.password, 10, (err, hash)=>{
            if(err){
                console.log('Error in storing password : ', err);
                res.status(400).json(err);
                return;
            }else{   
                console.log("***************",typeof(req.body.phone));
                console.log(typeof(req.body.name));
                const user = new User({
                    _id : new mongoose.Types.ObjectId,
                    email : req.body.email,
                    password : hash,
                    name : req.body.name,
                    phone: req.body.phone,
                    active : req.body.active,
                    created_at : req.body.created_at,
                    updated_at : req.body.updated_at,
                    role : req.body.role
                });
               req.saveData = user;
               next();
               return;   
            }
        });
    }

    async createUserHelper(req,res,next){
        try{
            const user = req.saveData;
            const result = await user.save();
            console.log(user);
            res.status(201).json({
                message : 'User created',
                result : result
            });
        }catch(error){
            console.log('Error in creating user : ', error);
            res.status(400).json({
                message : error
            });
        }
    }

    async deleteUser(req, res, next) { //deletes users
        if(util.isUndefined(req.params.userId, 1)){
            res.status(400).json({
                message : "Mention a user id to delete the user account"
            })
            return;
        }
        try{
            const result = await User.remove({_id : req.params.userId}).exec(); 
            console.log(result);
            res.status(200).json({
                result : result,
                message : 'User deleted'
            });
            return;     
        }catch(error) {
            console.log(error);
            res.status(400).json({
                message:error
            });
        };     
    }
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
    async displayUsers(req, res,next) {
        try{
            const tempusers = await User.find().exec();
            const size = tempusers.length;
            console.log(req.startIndex, req.endIndex, req.page,req.limit);
            let result = tempusers.slice(req.startIndex, req.endIndex);
            console.log(result.length);
            console.log(typeof result);
            console.log(result);
            let docs = [];
            for(let i=0;i<result.length;i++){
                let doc = {};
                doc['_id'] = result[i]._id;
                doc['email'] = result[i].email;
                doc['name'] = result[i].name;
                doc['phone'] = result[i].phone;
                doc['role'] = result[i].role;
                docs.push(doc);
            }
            const users_list = {};
            users_list.docs = docs;
            users_list.previousPage = {};
            users_list.nextPage= {};
            if(req.startIndex>0){
                users_list.previousPage ={
                    page : req.page-1,
                    limit : req.limit
                }
            }
                
            if(req.endIndex<size){
                users_list.nextPage = {
                    page : req.page+1,
                    limit : req.limit
                }
            }
            res.status(200).json({users_list});
        }catch(error){
            res.status(400).json({
                message:error
            });
        }
    }

    
}

module.exports = new UserHelper();