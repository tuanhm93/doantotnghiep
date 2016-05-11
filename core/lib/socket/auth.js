var redisConnections = require('../selector/redis/redis');
var mongoConncetions = require('../selector/mongodb/mongodb');
var app = require('express-singleton');
var redis = redisConnections.getConnection('token');
var mongo = mongoConncetions.getConnection('iship');
var lodash = require('lodash');
var consts = require('../consts/consts');
var Promise = require('bluebird');

module.exports = function(socket){
	socket.on('auth', function(token, fn){
		console.log('auth: ', token);
		token = token || '';
		fn = fn || function(){};
		if(!token){
			return fn({code: consts.CODE.WRONG_PARAM});
		}
		Promise
			.delay(0)
			.then(function(){
				return redis.getAsync(token);
			})
			.then(function(userid){
				console.log("Userid: ", userid);
				if(!userid){
					return Promise.reject({code: consts.CODE.TOKEN_EXPIRE});
				}
				return app
						.get('models')
						.User
						.findOne({_id: userid}, {username: 1, email: 1, phoneNumber: 1, avatar: 1, actived: 1, userType: 1, accountType: 1});
			})
			.then(function(userInf){
				if(!userInf){
					return Promise.reject({code: consts.CODE.TOKEN_EXPIRE});
				}else{
					socket.data.state = consts.CODE.NORMAL_STATE;
					socket.data.userid = userInf._id.toString();
					fn({code: consts.CODE.SUCCESS, user: userInf});
				}
			})
			.catch(function(err){
				if(lodash.isError(err)){
					console.error(err);
					fn({code: consts.CODE.ERROR})
				}else{
					fn(err);
				}
			});
	});
}