var app = require('express-singleton');
var consts = require('../consts/consts');

module.exports = function(socket){
	socket.on('has_arrived', function(data){
		var shipid = data.shipid;
		socket.to(shipid).emit('has_arrived');
		app
			.get('models')
			.Ship
			.update({
				id:  shipid
			},
			{
				arrivedAt: Date.now()
			})
			.then(function(r){
				console.log('Update ship arrivedAt: ', r);
			})
			.catch(function(e){
				console.error(e);
			});
	});
	socket.on('start_ship', function(data){
		var shipid = data.shipid;
		socket.to(shipid).emit('start_ship');
		app
			.get('models')
			.Ship
			.update({
				id:  shipid
			},
			{
				startedAt: Date.now()
			})
			.then(function(r){
				console.log('Update ship startedAt: ', r);
			})
			.catch(function(e){
				console.error(e);
			});
	});
	socket.on('finish_ship', function(data){
		var shipid = data.shipid;
		socket.to(shipid).emit('finish_ship');
		app
			.get('models')
			.Ship
			.update({
				id:  shipid
			},
			{
				endedAt: Date.now(),
				status: 1
			})
			.then(function(r){
				console.log('Update ship endedAt: ', r);
			})
			.catch(function(e){
				console.error(e);
			});
	});
}