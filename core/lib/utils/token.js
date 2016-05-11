var app = require('express-singleton');
var consts = require('../consts/consts');
var Promise = require('bluebird');
var express = require('express');
var lodash = require('lodash');
var router = express.Router();
var validator = require('validator');
var userUtils = require('../utils/user');
var facebookUtils = require('../utils/facebook');
var redisConnections = require('../selector/redis/redis');
var redisUtils = require('./redis');
var md5 = require('md5');
var config = require('config');

var generateToken= function (userid){
	var key = redisUtils.getUserTokenKey(userid);
	var token = md5(Date.now());

	return redisConnections
				.getConnection('token')
				.getAsync(key)
				.then(function(r){
					if(r){
						return redisConnections
								.getConnection('token')
								.multi()
								.del(r)
								.set(key, token)
								.set(token, userid)
								.execAsync()
								.then(function(r){
									return token;
								});

					}else{
						return redisConnections
								.getConnection('token')
								.multi()
								.set(key, token)
								.set(token, userid)
								.execAsync()
								.then(function(r){
									return token;
								});
					}	
				});
}

var getUserFromToken = function(token){
	return redisConnections
				.getConnection('token')
				.getAsync(token);
}

module.exports = {
	generateToken: generateToken
}


