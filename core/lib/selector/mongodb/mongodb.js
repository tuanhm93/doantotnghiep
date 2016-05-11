/**
 * Created by bi on 1/27/16.
 */

var connection = require('./connections');
var Selector = {};

Selector.getConnection = function (name) {
  if (connection[name]) {
    return connection[name];
  }
  throw new Error('Can not find mongo connection: ', name);
};

module.exports = Selector;