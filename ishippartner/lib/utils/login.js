var consts = require('../consts/consts');

function login(user){
	return fetch(consts.webServerUrl+'/login', {
			  method: 'POST',
			  headers: {
			    'Content-Type': 'application/json',
			  },
			  body: JSON.stringify({
			  	type: consts.ACCOUNT_TYPE.NORMAL,
			  	email: user.email,
			  	password: user.password
			  })
		  }).then(function(r){
		  	return r.json();
		  });
}

module.exports = {
	login: login
}