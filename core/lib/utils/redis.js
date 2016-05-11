var util = require('util');
var redisUtil = {};

var USER_TOKEN_KEY = 'token:%s';

redisUtil.getUserTokenKey = function (userid) {
	return util.format(USER_TOKEN_KEY,userid);
};

module.exports = redisUtil;