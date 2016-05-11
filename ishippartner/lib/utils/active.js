var consts = require('../consts/consts');

function active(code, email){
	return fetch(consts.webServerUrl+'/active', {
			  method: 'POST',
			  headers: {
			    'Content-Type': 'application/json',
			  },
			  body: JSON.stringify({
			  	code: code,
			  	email: email
			  })
		  }).then(function(r){
		  	return r.json();
		  });
}

function resendCode(email){
	return fetch(consts.webServerUrl+'/resendcode', {
			  method: 'POST',
			  headers: {
			    'Content-Type': 'application/json',
			  },
			  body: JSON.stringify({
			  	email: email
			  })
		  }).then(function(r){
		  	return r.json();
		  });
}

module.exports = {
	active: active,
	resendCode: resendCode
}