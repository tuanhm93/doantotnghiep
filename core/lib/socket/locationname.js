var uri = "https://maps.googleapis.com/maps/api/geocode/json?";
var consts = require('../consts/consts');
var rp = require('request-promise');

var getLocationName = function(location){
	var options = {
	    uri: uri+"key="+consts.GOOGLE_DIRECTION_KEY+"&address="+location.latitude+","+location.longitude,
	    method: 'GET',
		transform: function (body) {
			return JSON.parse(body);
		}
	};
	return rp(options);
}

var app = require('express-singleton');

module.exports = function(socket){
	socket.on('location_name', function(location){
		console.log('Get location name: ', JSON.stringify(location));
		getLocationName(location)
		.then(function(result){
			console.log(result);
			if(result.status == 'OK'){
				var roadName = "";
				var roadInf  = result.results[0].address_components;
				for(var i=0; i < roadInf.length; i++){
					if(roadInf[i].types[0] == "street_number"){
						roadName += roadInf[i].long_name +" ";
					}else if(roadInf[i].types[0] == "route"){
						roadName += roadInf[i].long_name +", ";
					}else if(roadInf[i].types[0] == "sublocality_level_1"){
						roadName += roadInf[i].long_name +", ";
					}else if(roadInf[i].types[0] == "sublocality_level_2"){
						roadName += roadInf[i].long_name +", ";
					}else if(roadInf[i].types[0] == "administrative_area_level_2"){
						roadName += roadInf[i].long_name +", ";
					}else if(roadInf[i].types[0] == "administrative_area_level_1"){
						roadName += roadInf[i].long_name;
					}
				}
				socket.emit('location_name', {roadName: roadName});
			}
		}).catch(function(err){
			console.log(err);
		});
	});
}