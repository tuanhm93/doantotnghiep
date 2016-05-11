/**
 * Created by bi on 3/25/16.
 */

var fs = require("fs");
var path = require("path");
var models = {};

fs
	.readdirSync(__dirname)
	.filter(function(file) {
		return (file.indexOf(".") !== 0) && (file !== "index.js");
	})
	.forEach(function(file) {
		models[path.basename(file, '.js')] = require('./' + file);
	});

module.exports = models;