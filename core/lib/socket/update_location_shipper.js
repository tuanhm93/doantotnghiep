var app = require('express-singleton');
var consts = require('../consts/consts');

module.exports = function(socket){
	socket.on('update_location_shipper', function(data){
		console.log('update_location_shipper: ', data);
		var userid = socket.data.userid;
		if(socket.data.state == consts.CODE.DRIVER_SHIPPING){
			var shipid = data.shipid;
			socket.to(shipid).emit('get_shippers', {
				minutes: -1,
				shippers: [{
					userid: userid,
					location: {
						latitude: data.latitude,
						longitude: data.longitude
					}
				}]
			});
			app
				.get('models')
				.Ship 
				.update({
					id: shipid
				},{
					$push: {moves: data}
				})
				.then(function(r){
					console.log('Update move shipper: ', r);
				})
				.catch(function(e){
					console.error(e);
				});
		}else{
			app
				.get('models')
				.Location
				.update({
					userid: userid
				}, 
				{
					location: {
						type: 'Point',
						coordinates: [data.longitude, data.latitude]
					}
				})
				.then(function(r){
					console.log("Update location shipper: ", r);
				})
				.catch(function(err){
					console.error(err);
				});
		}
	});
}