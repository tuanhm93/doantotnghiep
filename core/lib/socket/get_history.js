var app = require('express-singleton');
var consts = require('../consts/consts');
var async = require('async');
var moment = require('moment');

module.exports = function(socket){
	socket.on('get_history', function(data){
		console.log('get_history: ', JSON.stringify(data));
		var start = data.start;
		var workMode = data.workMode;
		var userid = socket.data.userid;

		if(workMode == 'caller'){
			app
				.get('models')
				.Ship 
				.find({
					callerId: userid
				})
				.skip(start)
				.limit(10)
				.sort({createdAt: 1})
				.then(function(result){
					console.log("Number histories: ", result.length);
					async.map(result, function(item, callback){
						var shipperId = item.shipperId;
						app
							.get('models')
							.User 
							.findOne({_id: shipperId}, {username: 1, avatar: 1})
							.then(function(result){
								console.log(result);
								var data = {};
								data.user = result;
								var keys = Object.keys(item._doc);
								for(var i = 0; i < keys.length; i++){
									data[keys[i]] = item._doc[keys[i]];
								}
								callback(null, data);
							})
							.catch(function(err){
								callback(err);
							});
					},
					function(err, results){
						console.log(JSON.stringify(results));
						if(err){
							console.error(err);
						}else{
							socket.emit('get_history', {histories: results});
						}
					});
				})
				.catch(function(err){
					console.error(err);
				})
		}else if(workMode == 'shipper'){
			app
				.get('models')
				.Ship 
				.find({
					shipperId: userid
				})
				.skip(start)
				.limit(10)
				.sort({createdAt: 1})
				.then(function(result){
					console.log("Number histories: ", result.length);
					async.map(result, function(item, callback){
						var callerId = item.callerId;
						app
							.get('models')
							.User 
							.findOne({_id: callerId}, {username: 1, avatar: 1})
							.then(function(result){
								console.log(result);
								var data = {};
								data.user = result;
								var keys = Object.keys(item._doc);
								for(var i = 0; i < keys.length; i++){
									data[keys[i]] = item._doc[keys[i]];
								}
								callback(null, data);
							})
							.catch(function(err){
								callback(err);
							})
					},
					function(err, results){
						console.log(JSON.stringify(results));
						if(err){
							console.error(err);
						}else{
							socket.emit('get_history', {histories: results});
						}
					});
				})
				.catch(function(err){
					console.error(err);
				})
		}
	});
}