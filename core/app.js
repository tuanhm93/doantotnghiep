var config = require('config');
var consts = require('./lib/consts/consts');
var Singleton = require('express-singleton');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');

var mongodbConnections = require('./lib/selector/mongodb/connections');
var redisConnections = require('./lib/selector/redis/connections');
var routes = require('./lib/routes');
var models = require('./lib/models');

// global variable
Singleton.set('models', models);

// middleware
app.use(morgan('dev'));
app.use(bodyParser.json());

routes(app);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.json({
      message: err.message,
      error: err,
      code: consts.COMMON.ERROR
    });
  });
}

app.use(function (err, req, res, next) {
  if (!req.headers) {
    res.status(err.status || 500);
    res.json({
      message: err.message,
      error: {},
      code: consts.COMMON.ERROR
    });
  }
});

module.exports = app;