const mongoose = require('mongoose');

const podSchema = mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    trip_id : {type:mongoose.Schema.Types.ObjectId, ref : 'Trip', required:true},
    pod : {type:String},
    status: {
        type:String,
        enum : ['created','approved','rejected'],
        default : 'created'
    },
    created_at :{type:Date, default : () => Date.now(), immutable:true},
    updated_at :{type:Date, default : () => Date.now()},
});

module.exports = mongoose.model('Pod', podSchema);