const mongoose = require('mongoose');

const paymentReqSchema = mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    trip_id : {type:mongoose.Schema.Types.ObjectId, ref : 'Trip', required:true},
    status: {
        type:String,
        enum : ['created','success','failed'],
        default : 'created'
    },
    trip_amount : {type:Number},
    incentive : {type:Number},
    penalty : {type:Number},
    created_at :{type:Date, default : () => Date.now(), immutable:true},
    processed_at :{type:Date, default : () => Date.now()},
});

module.exports = mongoose.model('Payment_Req', paymentReqSchema);