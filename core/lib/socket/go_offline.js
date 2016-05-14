var app = require('express-singleton');
var consts = require('../consts/consts');

module.exports = function(socket){
	socket.on('go_offline', function(fn){
		fn = fn || function(){};
		console.log('go_offline');
		var userid = socket.data.userid;
		console.log("Userid: ", userid);
		app
			.get('models')
			.Location
			.remove({
				userid: userid,
				sid: socket.id
			})
			.then(function(r){
				console.log('Remove: ',  r.result);
				socket.data.state = consts.CODE.NORMAL_STATE;
				fn({code: consts.CODE.SUCCESS});
			})
			.catch(function(e){
				console.error('Error: ', e);
				socket.data.state = consts.CODE.DRIVER_WAIT;
				fn({code: consts.CODE.ERROR});
			})
	});
}