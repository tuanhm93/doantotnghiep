var app = require('express-singleton');
var consts = require('../consts/consts');

module.exports = function(socket){
	socket.on('go_offline', function(fn){
		fn = fn || function(){};
		console.log('go_offline');
		var userid = socket.data.userid;
		console.log("Userid: ", userid);
		if(socket.data.state == consts.CODE.DRIVER_WAIT){
			socket.data.state = consts.CODE.NORMAL_STATE;
			app
				.get('models')
				.Location
				.remove({
					userid: userid
				})
				.then(function(r){
					console.log('Remove: ',  r.result);
					fn({code: consts.CODE.SUCCESS});
				})
				.catch(function(e){
					console.error('Error: ', e);
					socket.data.state = consts.CODE.DRIVER_WAIT;
					fn({code: consts.CODE.ERROR});
				})
		}else{
			fn({code: consts.CODE.FAILD});
		}
	});
}