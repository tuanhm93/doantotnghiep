var React = require('react-native');
var consts = require('../consts/consts');
var app = require('../share/app');

if (!window.location) {
    // App is running in simulator
    window.navigator.userAgent = 'ReactNative';
}
const io = require('socket.io-client/socket.io');

var Socket = function(url, token){
	this.url = url || consts.webServerUrl;
	this.token = token || '';
	this.socket = null;
}

Socket.prototype.connect = function(callback){
	var _self = this;
	this.socket = io(this.url, {
  		transports: ['websocket'] // you need to explicitly tell it to use websockets
	});
	this.socket.on('connect', function(){
		console.log('Connected to socket');
		_self.socket.emit('auth', _self.token, function(data){
			console.log('Auth: ', JSON.stringify(data));
			app.set('socket', _self.socket);
			callback(null, data);
		});
	})

	this.socket.on('connection_error', function(err){
		console.log('Socket error');
		callback('error');
	});

	this.socket.on('connection_timeout', function(err){
		console.log('Socket timeout');
		callback('timeout');
	})
}

Socket.prototype.getSocket = function(){
	return this.socket;
}

module.exports = Socket;
