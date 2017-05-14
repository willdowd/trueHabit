var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');
var authenticate = require('./authenticate');

var config = require('./config');

mongoose.connect(config.mongoUrl || 'mongodb://localhost:27017/trueHabit');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    // we're connected!
    console.log("Connected correctly to server");
});

var routes = require('./routes/index');
var users = require('./routes/users');
var habitRouter = require('./routes/habitRouter');

var app = express();

// Secure traffic only
// app.all('*', function(req, res, next){
//     //console.log('req header: ',req.header);
//     console.log('req start: ',req.secure, req.hostname, req.url, app.get('port'));
//   if (req.secure) {
//     return next();
//   };
//   console.log('res redirect to: https://'+req.hostname+':'+app.get('secPort')+req.url);
//   res.redirect('https://'+req.hostname+':'+app.get('secPort')+req.url);
//   console.log('res redirect done');
// });

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));

// app.use(function (req, res, next) {
//     //headers that enable corse
//     res.header('Access-Control-Allow-Origin', '*');
//     res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH');
//     res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//     next();
// });

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// passport config
console.log("call to app.use passport initialize - start");
app.use(passport.initialize());
console.log("call to app.use passport initialize - end");

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);
app.use('/habits',habitRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.json({
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.json({
    message: err.message,
    error: err
    //error: {}
  });
});

module.exports = app;