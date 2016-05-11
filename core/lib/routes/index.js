/**
 * Created by bi on 3/25/16.
 */

var fs = require("fs");

module.exports = function (app) {
	fs
		.readdirSync(__dirname)
		.filter(function(file) {
			return (file.indexOf(".") !== 0) && (file !== "index.js");
		})
		.forEach(function(file) {
			var route = require('./' + file);
			route(app);
		});
};