let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');


let carparks = require('./routes/carparks');
let search = require('./routes/search');
let reserve = require('./routes/reserve');
let app = express();
app.io=0;

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//Routen Definierung

app.use('/reserve', reserve);
app.use('/carparks', carparks);
app.use('/search', search);

//Routen Definierung Ende
module.exports = app;
