var bluebird = require('bluebird');
var FBLoginManager = require('NativeModules').FBLoginManager;

var loginWithPermissionsAsync = bluebird.promisify(FBLoginManager.loginWithPermissions);
var logoutAsync = bluebird.promisify(FBLoginManager.logout);

var loginFacebook = function(){
	var accessToken = '';
	return 
		loginWithPermissionsAsync(["email","public_profile"])
		.then(function(data){
			accessToken = data.token
			return logoutAsync();
		}).then(function(data){
			return accessToken;
		});
}