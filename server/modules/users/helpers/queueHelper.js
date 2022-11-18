const express = require('express');

const router = express.Router();

const mongoose = require('mongoose');

const bcrypt = require('bcrypt');

const Trip = require('../../trips/models/trip');

const User = require('../models/user');

const Rate_Card = require('../../ratecards/models/rate_card');

const Payment_Req = require('../../payment_req/models/payment_req');

const rateCardHelper = require('../../ratecards/helpers/rateCardHelper')

const jwt = require('jsonwebtoken');

const process = require('../../../../nodemon.json');

const Pod = require('../../pod/models/pod');

const util = require('../../../core/util');

const {REDIS_URL, REDIS_PORT} = require('../../../core/redisCredentials');

const Queue = require('bull');

class BullQueue {
    queue;
    constructor(){
        this.queue = new Queue('paymentQueue', {
            redis :{
                port : REDIS_PORT,
                host : REDIS_URL
            }
        });
        this.queue.process('paymentRequestJob', async (job) => {
            await this.addPayment();
            console.log('reapeatable job is running')
          });

    }

    async addPayment (){
        try{
            const docs = await Pod.find({status:'approved'}).exec(); //fetching all verified pods
            console.log("DOCS", docs);
            let paymentRequests = [];
            for(let i=0; i<docs.length; i++){
                let doc = docs[i];
                let tripId = doc.trip_id;
                let amount=0, penalty=0, incentive=0, total_sum=0, ratecardId, start_time, actual_start_time, total_kms, actual_kms;
                try{
                    const trips = await Trip.find({_id:tripId}).exec();    //individual pod trip details fetch
                    if(trips.length<1){
                        console.log('Not found');
                        return;
                    }
                    console.log("TRIPS", trips);
                    ratecardId = trips[0].rate_card;
                    actual_start_time = trips[0].actual_start_time.getTime();
                    actual_start_time = ((actual_start_time)/(1000*60));
                    actual_kms = trips[0].actual_kms;
                    start_time = trips[0].start_time.getTime();
                    start_time = ((start_time)/(1000*60));
                    total_kms = trips[0].total_kms;
                    try{
                        const ratecards = await Rate_Card.find({_id:ratecardId}).exec();  //trip ratecard fetch
                        if(ratecards.length<1){
                            console.log('Not found');
                            return;
                        }
                        console.log("RATECARDS", ratecards);
                        amount = ratecards[0].price * actual_kms;   
                        if(actual_start_time>start_time)
                            penalty = (ratecards[0].penalty *(actual_start_time - start_time));
                        if(actual_kms>total_kms)
                            incentive = (ratecards[0].incentive * (actual_kms - total_kms));
                        total_sum = amount + incentive - penalty;
                        const paymentDoc = new Payment_Req({
                            _id : new mongoose.Types.ObjectId,
                            status : 'created',
                            incentive : incentive,
                            penalty : penalty,
                            trip_amount : amount,
                            trip_id : tripId,
                        });
                      
                        const doc = await paymentDoc.save();       //saving payment request for that trip
                        console.log("SAVING PAYMENT REQUEST", doc);
                        let updateOps = {};
                        updateOps.status = 'completed';
                        const result = await Pod.updateOne({trip_id:tripId, status:'approved'}, {$set : updateOps}).exec();   //update pod to complete
                        console.log("UPDATE POD STATE TO COMPLETED",result);

                    }catch(error){
                        console.log(error);
                    }
                }catch(error){
                    console.log(error);
                }
            }

        }catch(error){
            console.log(error);
        }
    } 
    async addRepeatableJobToQueue() {
        await this.queue.add(
          'paymentRequestJob',
          {},
          {
            jobId:"customJobId",
            repeat:{
              every: 10000,
              limit: 100
            }
          }
        );
      }   
}

module.exports = new BullQueue();