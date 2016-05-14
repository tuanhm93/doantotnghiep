var app = require('express-singleton');
var consts = require('../consts/consts');

module.exports = function(socket){
	socket.on('go_online', function(data){
		console.log('go_online: ', JSON.stringify(data));
		var userid = socket.data.userid;
		var location = data.location;
		var radius = data.radius;
		var shipType = data.shipType;

		app
			.get('models')
			.Location
			.findOneAndUpdate({
				userid: userid
			},
			{
				sid: socket.id,
				radius: radius,
				shipType: shipType,
				location: {
					type: 'Point',
					coordinates: [location.longitude, location.latitude]
				},
				status: 0
			},
			{
				upsert: true,
				new: true
			})
			.then(function(r){
				console.log('Create shipper: ', r);
				socket.data.state = consts.CODE.DRIVER_WAIT;
				socket.emit('go_online', {code: consts.CODE.SUCCESS});
			})
			.catch(function(err){
				console.error(err);
				socket.emit('go_online', {code: consts.CODE.ERROR});
			});
	});
}