const mongoose = require('mongoose');
const moment = require('moment');
const userSchema = mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    email : {
        type:String, 
        required:true, 
        unique:true,
        match : /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/,
    },
    password : {type:String, required:true},
    name :{type:String, required:true},
    phone : {type:Number, required:true},
    active :{type:Boolean},
    created_at :{type:Date, default : () => Date.now(), immutable:true},
    updated_at :{type:Date, default : () => Date.now()},
    role :{
        type:String,
        enum : ['admin', 'driver', 'payment_exec'],
        required:true
    }
});

module.exports = mongoose.model('User', userSchema);