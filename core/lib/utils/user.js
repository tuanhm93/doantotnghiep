var config = require('config');
var md5 = require('md5');

var hashPassword = function(password){
	var SECRET = config.SECRET || 'tuanhm';
	var passwordHash = password + SECRET;
	return md5(passwordHash);
}


module.exports = {
	hashPassword: hashPassword
}
