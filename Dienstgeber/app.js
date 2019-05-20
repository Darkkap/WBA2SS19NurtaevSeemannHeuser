let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');


let function2 = require('./routes/function2');
let usersRouter = require('./routes/users');
let function1 = require('./routes/function1');
let app = express();
app.io=0;

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//Routen Definierung

app.use('/function1', function1);
app.use('/function2', function2);
app.use('/users', usersRouter);

//Routen Definierung Ende
module.exports = app;
