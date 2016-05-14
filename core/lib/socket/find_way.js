var app = require('express-singleton');
var consts = require('../consts/consts');
var rp = require('request-promise');
var polyline = require('polyline');

module.exports = function(socket){
	socket.on('find_way', function(data){
		var startPoint = data.startPoint;
		var endPoints = data.endPoints;

		var result = processData(startPoint, endPoints);
		console.log(JSON.stringify(result));

		getInfRoad(result.origin, result.destination, result.wayPoints)
		.then(function(result){
			// console.log(JSON.stringify(result));
			if(result.status == 'OK'){
				var encodePolyline = result.routes[0].overview_polyline.points;
				// console.log('Encode: ', encodePolyline);
				var polylines = polyline.decode(result.routes[0].overview_polyline.points);
				// console.log('Decode: ', polylines);
				var roads = [];
				for(var i=0;i<polylines.length;i++){
					var point = {
						latitude: polylines[i][0],
						longitude: polylines[i][1]
					}
					roads.push(point);
				}
				// console.log('Send to client: ', roads);
				socket.emit('find_way', {coordinates: roads});
			}
		})
		.catch(function(err){
			console.log(err);
		});
	});
}

function processData(startPoint, endPoints){
	var orders = [];

	while(endPoints.length != 0){
		var length = endPoints.length;
		var minimumDistance = distance(startPoint, endPoints[0]);
		var index = 0;
		for(var i = 1; i < length; i++){
			var space = distance(startPoint, endPoints[i]);
			if(space < minimumDistance){
				minimumDistance = space;
				index = i;
			}
		}
		var minimumPoint = endPoints[index];
		orders.push([minimumPoint.latitude, minimumPoint.longitude]);
		endPoints.splice(index, 1);
	}

	var endPoint = orders.pop();
	var startPoint =  ""+startPoint.latitude+","+startPoint.longitude;
	endPoint = ""+endPoint[0]+","+endPoint[1];
	var wayPoints = "";
	if(orders.length != 0){
		wayPoints = "enc:" + polyline.encode(orders) + ":";
	}

	return  {
		origin: startPoint,
		destination: endPoint,
		wayPoints: wayPoints
	};
}

function distance(point1, point2){
	return getDistanceFromLatLonInKm(point1.latitude, point1.longitude, point2.latitude, point2.longitude);
}

function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}


var uri = "https://maps.googleapis.com/maps/api/directions/json?";

var getInfRoad = function(startPoint, endPoint, wayPoints){
	var options = {
	    uri: uri+"origin="+startPoint+"&destination="+
	    	endPoint+"&waypoints="+wayPoints+"&key=" + consts.GOOGLE_DIRECTION_KEY,
	    method: 'GET',
		transform: function (body) {
			return JSON.parse(body);
		}
	};
	return rp(options);
}