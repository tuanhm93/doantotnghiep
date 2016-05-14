var app = require('express-singleton');
var consts = require('../consts/consts');
var Promise = require('bluebird');

function getShippers(location){
	var maxDistance = consts.MAX_DISTANCE;
	console.log('Max distance: ', maxDistance);
	return app
				.get('models')
				.Location
				.where('location')
				.near({
					center: {
						type: 'Point',
						coordinates: [location.longitude, location.latitude]
					}, spherical: true, maxDistance: maxDistance});
}

module.exports = function(socket){
	socket.on('get_shippers', function(data){
		console.log("get_shippers: ", data);
		var location = data.location;
		var shipType = data.shipType;

		Promise
			.delay(0)
			.then(function(){
				return getShippers(location);
			})
			.then(function(results){
				console.log(results);
				var length = results.length;
				var shippers = [];
				for(var i=0; i<length; i++){
					if( (results[i].shipType & shipType) == shipType){
						shippers.push({
							userid: results[i].userid,
							location:{
								longitude: results[i].location.coordinates[0],
								latitude: results[i].location.coordinates[1]
							}
						});
					}
				}
				var data = {};
				data.shippers = shippers;
				if(shippers.length != 0){
					data.minutes = 10;
				}

				socket.emit('get_shippers', data);
			})
			.catch(function(err){
				console.log(err);
			})
	});
}