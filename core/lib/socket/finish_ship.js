var app = require('express-singleton');
var consts = require('../consts/consts');

module.exports = function(socket){
	socket.on('reset_status', function(){
		var userid = socket.data.userid;
		app
			.get('models')
			.Location
			.update({
				userid: userid,
				sid: socket.id
			},
			{
				status: 0
			})
			.then(function(r){
				console.log('Finish ship: ', r);
			})
			.catch(function(err){
				console.error(err);
			});
	});
}