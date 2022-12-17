const express = require('express');
const app = express(); 
const router = express.Router();
const morgan= require('morgan'); 

app.use(morgan('dev'));
app.use('/uploads',express.static('uploads'));

const mongoose = require('mongoose');
mongoose.connect(''); //link hidden for security reasons

const bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended : true})); //form-data
app.use(bodyParser.json());

const userRoutes = require('./server/modules/users/handlers/users');
const tripRoutes = require('./server/modules/trips/handlers/trips');
const rateCardRoutes = require('./server/modules/ratecards/handlers/ratecard');
const paymentRequestRoutes = require('./server/modules/payment_req/handlers/payment_req');
const ledgerRoutes = require('./server/modules/ledger/handlers/ledger');

app.set('view engine', 'ejs');
app.use('/user', userRoutes);
app.use('/trip', tripRoutes);
app.use('/rate', /*rateCardRoutes.init(router)*/ rateCardRoutes);
app.use('/paymentrequests', paymentRequestRoutes);
app.use('/ledger', ledgerRoutes);
app.get('/home',(req, res, next)=>{
    res.render('home');
});


module.exports = app;

