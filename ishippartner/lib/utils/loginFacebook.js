var consts = require('../consts/consts');

function loginFacebook(accessToken){
	return fetch(consts.webServerUrl+'/login', {
			  method: 'POST',
			  headers: {
			    'Content-Type': 'application/json',
			  },
			  body: JSON.stringify({
			    type: consts.ACCOUNT_TYPE.FACEBOOK,
			    accessToken: accessToken,
			  })
		  }).then(function(r){
		  	return r.json();
		  });
}

module.exports = {
	loginFacebook: loginFacebook
}