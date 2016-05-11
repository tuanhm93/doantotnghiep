/**
 * Created by bi on 1/28/16.
 */


var fs = require("fs");
var path = require("path");
var connection = {};

fs
  .readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf(".") !== 0) && (file !== "index.js");
  })
  .forEach(function(file) {
    connection[path.basename(file, '.js')] = require('./' + file);
  });

module.exports = connection;