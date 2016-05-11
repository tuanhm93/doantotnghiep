var app = require('express-singleton');
var consts = require('../consts/consts');

module.exports = function(socket){
	socket.on('send_message', function(data){
		console.log('send_message: ', JSON.stringify(data));
		var shipid = data.shipid;
		socket.to(shipid).emit('get_message', {text: data.text, id: data.id});
		socket.emit('send_message', {id: data.id});
	});
}