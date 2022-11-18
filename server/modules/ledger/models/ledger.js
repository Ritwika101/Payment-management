const mongoose = require('mongoose');

const ledgerSchema = mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    amount : {type:Number, set: function (v) { return Math.round(v) ;}},
    user_id : {type:mongoose.Schema.Types.ObjectId, ref : 'User', required:true},
    date :{type:Date, default : () => Date.now()}, 
    type: {
        type:String,
        enum : ['credit','debit']
    }
});

module.exports = mongoose.model('Ledger', ledgerSchema);