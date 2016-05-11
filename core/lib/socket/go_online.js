var app = require('express-singleton');
var consts = require('../consts/consts');

module.exports = function(socket){
	socket.on('go_online', function(location){
		console.log('go_online: ', JSON.stringify(location));
		var userid = socket.data.userid;
		socket.data.state = consts.CODE.DRIVER_WAIT;
		console.log('Userid: ', userid);
		app
			.get('models')
			.Location
			.create({
				userid: userid,
				sid: socket.id,
				location: {
					type: 'Point',
					coordinates: [location.longitude, location.latitude]
				}
			});
	});
}