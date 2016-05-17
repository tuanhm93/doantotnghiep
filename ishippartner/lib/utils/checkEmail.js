var consts = require('../consts/consts');

function checkEmail(email){
	return fetch(consts.webServerUrl+'/check-email', {
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

function resetPassword(password, email){
	return fetch(consts.webServerUrl+'/reset-password', {
			  method: 'POST',
			  headers: {
			    'Content-Type': 'application/json',
			  },
			  body: JSON.stringify({
			  	email: email,
			  	password: password
			  })
		  }).then(function(r){
		  	return r.json();
		  });
}


module.exports = {
	checkEmail: checkEmail,
	resetPassword: resetPassword
}