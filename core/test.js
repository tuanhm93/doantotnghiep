var test = require('./lib/utils/facebook');

test.getUserProfile("EAARu22rIDokBACI3Sgbfq8B37daqoMIkrzMjuHtCsWGPv8LQZCfw5W1sdrTyBzXjHX5YtFsZCt7qvLEiUYqOVx058n8jE1W3LQaHZAsLJEoYaeYM3OM0b8MZAeNTPFk8osNeZC2i5Dc9ULdzYJrfjCFDE8KYyHdwET8fl4w9dJ2ZCUKoZCH6w7cK4yz1iwF5UcBO2514L6HV1ad2NmXH2ZAM")
	.then(function(r){
		console.log(r);
	}).catch(function(r){
		console.log(r);
	});