var consts = require('../consts/consts');
var uri = "https://maps.googleapis.com/maps/api/geocode/json?"
var key = "AIzaSyDC6rWzBLRa_QS_-h40-LOdcFB0otc8tqM";
function getLocationName(location){
	return fetch(uri+ "address="+location.latitude+","+location.longitude+"&key="+key, {
			  method: 'GET'
		  }).then(function(r){
		  	return r.json();
		  });
}

module.exports = {
	getLocationName: getLocationName
}