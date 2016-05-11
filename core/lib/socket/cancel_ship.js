var app = require('express-singleton');
var consts = require('../consts/consts');

module.exports = function(socket, io){
	socket.on('cancel_ship', function(data){
		var shipid = data.shipid;
		var clients = io.sockets.adapter.rooms[shipid];

		if(clients.length == 2){
			var sids = Object.keys(clients.sockets);
			var anotherSocket = null;
			if(sids[0] == socket.id){
				anotherSocket = io.sockets.connected[sids[1]];
			}else{
				anotherSocket = io.sockets.connected[sids[0]];
			}

			anotherSocket.emit('cancel_ship');
		}
		var status = 2;
		if(socket.data.state == consts.CODE.DRIVER_SHIPPING){
			// He's shipper
			status = 3;
		}
		app
				.get('models')
				.Ship 
				.update({
					id: shipid
				}, {
					endedAt: Date.now(),
					status: status
				})
				.then(function(r){
					console.log('Update cancel ship: ', r);
				})
				.catch(function(e){
					console.error(e);
				});
	});
}