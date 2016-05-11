module.exports = function(socket){
	socket.on('error', function(err){
		console.error(err);
	});
}