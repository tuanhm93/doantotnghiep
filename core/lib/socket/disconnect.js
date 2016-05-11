var app = require('express-singleton');

module.exports = function(socket){
	socket.on('disconnect', function(){
		console.log('Disconnect');
		
		userid = socket.data.userid || '';
		sid = socket.id;

		if(userid){
			app
				.get('models')
				.Location
				.remove({
					userid: userid,
					sid: sid
				})
				.then(function(r){
					console.log('Remove: ',  r.result);
				})
				.catch(function(e){
					console.error('Error: ', e);
				});
		}
	});
}