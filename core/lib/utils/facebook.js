var rp = require('request-promise');
var uri = "https://graph.facebook.com/v2.6/me?fields=id,name,email,picture&access_token=";

var getUserProfile = function(token){
	var options = {
	    uri: uri + token,
	    method: 'GET',
		transform: function (body) {
			return JSON.parse(body);
		}
	};
	return rp(options);
}

module.exports = {
	getUserProfile: getUserProfile
}