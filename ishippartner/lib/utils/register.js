var consts = require('../consts/consts');

function register(user){
	return fetch(consts.webServerUrl+'/register', {
			  method: 'POST',
			  headers: {
			    'Content-Type': 'application/json',
			  },
			  body: JSON.stringify(user)
		  }).then(function(r){
		  	return r.json();
		  });
}

module.exports = {
	register: register
}