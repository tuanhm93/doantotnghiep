var fs = require("fs");

module.exports = function (socket, io) {
	fs
		.readdirSync(__dirname)
		.filter(function(file) {
			return (file.indexOf(".") !== 0) && (file !== "index.js");
		})
		.forEach(function(file) {
			var route = require('./' + file);
			route(socket, io);
		});
};