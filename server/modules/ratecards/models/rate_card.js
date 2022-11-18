const mongoose = require('mongoose');

const rateCardSchema = mongoose.Schema({
    _id : mongoose.Schema.Types.ObjectId,
    price : {type:Number},
    penalty : {type:Number},
    incentive : {type:Number}
});

module.exports = mongoose.model('Rate_Card', rateCardSchema);