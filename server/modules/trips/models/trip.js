const mongoose = require('mongoose');
const moment = require('moment');
const tripSchema = mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    status: {
        type:String,
        enum : ['created','assigned', 'in_progess', 'completed'],
        default : 'created'
    },
    assigned_to : {type:mongoose.Schema.Types.ObjectId, ref : 'User'},
    created_at :{type:Date, default : () => Date.now(), immutable:true},
    updated_at :{type:Date, default : () => Date.now()},
    start_time : {type:Date, required:true},
    actual_start_time : {type:Date},
    total_kms : {type:Number, required:true},
    actual_kms : {type:Number},
    rate_card : {type:mongoose.Schema.Types.ObjectId, ref : 'Rate_Card', default :() => '62bc93f22bfd3448d80f999d',required:true}
});

module.exports = mongoose.model('Trip', tripSchema);