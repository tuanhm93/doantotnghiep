var app = require('express-singleton');
var consts = require('../consts/consts');

module.exports = function(socket){
	socket.on('client_reject', function(fn){
		console.log('client_reject');
		var userid = socket.data.userid;
		if(socket.data.state == consts.CODE.CLIENT_REQUEST){
			socket.data.state = consts.CODE.NORMAL_STATE;
			fn({code: consts.CODE.SUCCESS});
		}else{
			fn({code: consts.CODE.FAILD});
		}
	});
}