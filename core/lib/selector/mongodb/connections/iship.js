/**
 * Created by bi on 1/27/16.
 */

var config = require('config');
var mongoose = require('mongoose');
var model = mongoose.createConnection('mongodb://' + config.mongodb.iship.host + ':' + config.mongodb.iship.port + '/' + config.mongodb.iship.database);

module.exports = model;