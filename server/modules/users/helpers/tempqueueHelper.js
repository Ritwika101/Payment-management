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

class TempQueue {
    queue;
    constructor(){
        this.queue = new Queue('tempQueue', {
            redis :{
                port : REDIS_PORT,
                host : REDIS_URL
            }
        });
        this.queue.process('testJob', async (job) => {
            console.log('Test job is running')
          });

    }

 
    async addRepeatableJobToQueue() {
        await this.queue.add(
          'testJob',
          {},
          {
            jobId:"customJobId",
            repeat:{
              every: 1000,
              limit: 100
            }
          }
        );
      }   
}

module.exports = new TempQueue();