var app = require('express-singleton');
var async = require('async');
var Promise = require('bluebird');
var consts = require('../consts/consts');
var uuid = require('uuid');

function getShippers(location){
	var maxDistance = consts.MAX_DISTANCE;
	console.log('Max distance: ', maxDistance);
	return app
	.get('models')
	.Location
	.where('location')
	.near({
		center: {
			type: 'Point',
			coordinates: [location.longitude, location.latitude]
		}, spherical: true, maxDistance: maxDistance});
}

function eliminate(shippers, ignoreList){
	console.log(shippers, ignoreList);
	var shipperAvailable = [];
	var lengthShippers = shippers.length;
	var lengthIgnore = ignoreList.length;
	for(var i=0;i<lengthShippers; i++){
		var shipper = shippers[i];
		for(var j=0;j<lengthIgnore;j++){
			if(shipper.sid == ignoreList[j]){
				break;
			}
		}
		if(j == lengthIgnore){
			shipperAvailable.push(shipper);
		}
	}
	console.log(shipperAvailable);
	return shipperAvailable;
}

module.exports = function(socket, io){
	socket.on('connect_shipper1', function(data){
		console.log('connect_shipper: ', data); // startPoint, endPoints
		socket.data.state = consts.CODE.CLIENT_REQUEST; // Set up new state for client
		
		var startPoint = data.startPoint;
		var endPoints = data.endPoints;
		var userid = socket.data.userid;
		var ignoreList = [];

		var done = false;
		async.whilst(
			function() {return done == false},
			function(callback){
				if(socket.data.state == consts.CODE.CLIENT_REQUEST){
					Promise
					.delay(0)
					.then(function(){
						return getShippers(startPoint);
					})
					.then(function(shippers){
						shippers = eliminate(shippers, ignoreList);
						var numberShipper = shippers.length;
						if(numberShipper == 0){
							socket.emit('no_shipper_available');
							socket.data.state = consts.CODE.NORMAL_STATE;
							done = true;
							callback(null);
						}else{
							for(var i=0; i<numberShipper; i++){
								var shipper = shippers[i];
								var driverSocket = io.sockets.connected[shipper.sid];
								if(driverSocket != undefined){
									app
									.get('models')
									.User
									.findOne({_id: userid}, {avatar:1, username: 1, phoneNumber: 1})
									.then(function(user){
										if(driverSocket.data.state == consts.CODE.DRIVER_WAIT){
											user._id = user._id.toString();
											driverSocket.data.state = consts.CODE.DRIVER_GET_REQUEST;
											var timeout = false;
											driverSocket.emit('have_client', {user: user, startPoint: startPoint, endPoints: endPoints});

											driverSocket.once('have_client', function(res){
												console.log('have_client');
												if(!timeout){
													timeout = true;
													if(res.code == consts.CODE.ACCEPT){
														console.log('Driver accept');
														app
														.get('models')
														.User
														.findOne({_id: shipper.userid}, {avatar: 1, username: 1, phoneNumber: 1})
														.then(function(driver){
															if(socket.data.state == consts.CODE.CLIENT_REQUEST){
																console.log('Establish connect');

																driver._id = driver._id.toString();
																var shipid = uuid.v1();
																var location = {
																	latitude: shipper.location.coordinates[1],
																	longitude: shipper.location.coordinates[0]
																}
																socket.emit('establish', {user: driver, location: location, shipid: shipid});
																driverSocket.emit('establish', {shipid: shipid});
																socket.data.state = consts.CODE.CLIENT_SHIPPED;
																driverSocket.data.state = consts.CODE.DRIVER_SHIPPING;
																socket.join(shipid);
																driverSocket.join(shipid);
																var endPointsTemp = [];
																for(var i=0;i < endPoints.length; i++){
																	endPointsTemp[i] = {
																		coordinates: endPoints[i]
																	}
																}
																app
																	.get('models')
																	.Ship
																	.create({
																		id: shipid,
																		callerId: socket.data.userid,
																		shipperId: driverSocket.data.userid,
																		createdAt: Date.now(),
																		startPoint: {
																			coordinates: startPoint
																		},
																		endPoints: endPointsTemp,
																		moves: [location]
																	})
																	.then(function(r){
																		console.log('Create ship: ', shipid);
																	})
																	.catch(function(e){
																		console.error(e);
																	});
																app
																	.get('models')
																	.Location
																	.remove({
																		userid: shipper.userid
																	})
																	.then(function(r){
																		console.log("Remove shipper when has established");
																	})
																	.catch(function(e){
																		console.erorr(e);
																	});
															}else{
																driverSocket.data.state = consts.CODE.DRIVER_WAIT;
															}	

															done = true;
															callback(null);
														})
														.catch(function(err){
															driverSocket.data.state = consts.CODE.DRIVER_WAIT;
															console.error(err);
															callback(null);
														});								
													}else{
														console.log('Driver reject');
														driverSocket.data.state = consts.CODE.DRIVER_WAIT;
														ignoreList.push(shipper.sid);
														callback(null);
													}
												}
											});

											setTimeout(function(){
												console.log('Timeout');
												if(!timeout){
													timeout = true;
													driverSocket.data.state = consts.CODE.DRIVER_WAIT;
													driverSocket.removeAllListeners('have_client');
													ignoreList.push(shipper.sid);
													callback(null);
												}
											}, 16000);
										}else if(driverSocket.data.state != consts.CODE.DRIVER_GET_REQUEST){
											ignoreList.push(shipper.sid);
										}
									})
									.catch(function(err){
										console.error(err);
										callback(null);
									});
									break;
								}else{
									ignoreList.push(shipper.sid);
								}
							}
							if(i == numberShipper){
								callback(null);
							}
						}
					})
				}else{
					done = true;
					callback(null);
				}
			}
		);
	});

	socket.on('connect_shipper', function(data){
		console.log('connect_shipper: ', JSON.stringify(data)); // startPoint, endPoints
		socket.data.state = consts.CODE.CLIENT_REQUEST; // Set up new state for client
		var userid = socket.data.userid;

		var startPoint = data.startPoint;
		var endPoints = data.endPoints;
		var shipType = data.shipType;
		
		var radius = calculateRadius(startPoint, endPoints);
		console.log('Radius: ', radius);

		var ignoreListReject = [];
		var ignoreListTimeout = [];
		var stateSearch = 0;
		var isRetry = false;
		var numberRetry = 0;

		var done = false;
		async.whilst(
			function() {
				stateSearch ++;
				if(stateSearch == 6){
					stateSearch = 5;
					isRetry = true;
					numberRetry ++;
				}
				if(stateSearch != 7){
					console.log('State search: ', stateSearch);
					if(isRetry){
						console.log('Number retry: ', numberRetry);
					}
				} else {
					console.log('Done!');
					console.log('--------------------------------');
				}
				
				return stateSearch <= 5;
			},
			function(callback){
				handle(socket, startPoint, endPoints, ignoreListReject, ignoreListTimeout, radius, shipType, isRetry, numberRetry, callback);
			}
		);

		function handle(socket, startPoint, endPoints, ignoreListReject, ignoreListTimeout, radius, shipType, isRetry, numberRetry, callback){
			if(socket.data.state == consts.CODE.CLIENT_REQUEST){
				Promise
				.delay(0)
				.then(function(){
					return getShippers(startPoint);
				})
				.then(function(shippers){
					shippers = newEliminate(shippers, ignoreListReject, ignoreListTimeout, stateSearch, radius, shipType, isRetry);
					var numberShipper = shippers.length;
					if(numberShipper == 0){
						if(isRetry && (numberRetry == 2)){
							socket.emit('no_shipper_available');
							stateSearch = 6;
						}
						callback(null);
					}else{
						handleShipper(socket, startPoint, endPoints, shippers, ignoreListReject, ignoreListTimeout, callback);
					}
				});
			}else{
				stateSearch = 6;
				callback(null);
			}
		}

		function handleShipper(clientSocket, startPoint, endPoints, shippers, ignoreListReject, ignoreListTimeout, callback){
			console.log('handleShipper');
			var userid = clientSocket.data.userid;
			var numberShipper = shippers.length;

			for(var i=0; i<numberShipper; i++){
				var shipper = shippers[i];
				var shipperSocket = io.sockets.connected[shipper.sid];
				if(shipperSocket != undefined){
					app
						.get('models')
						.User
						.findOne({_id: userid}, {avatar:1, username: 1, phoneNumber: 1})
						.then(function(user){
							if(shipperSocket.data.state == consts.CODE.DRIVER_WAIT){
								user._id = user._id.toString();
								shipperSocket.data.state = consts.CODE.DRIVER_GET_REQUEST;
								var timeout = false;
								shipperSocket.emit('have_client', {user: user, startPoint: startPoint, endPoints: endPoints});

								shipperSocket.once('have_client', function(res){
									console.log('have_client');
									if(!timeout){
										timeout = true;
										if(res.code == consts.CODE.ACCEPT){
											console.log('Shipper accept');
											app
											.get('models')
											.User
											.findOne({_id: shipper.userid}, {avatar: 1, username: 1, phoneNumber: 1})
											.then(function(shipperInf){
												if(socket.data.state == consts.CODE.CLIENT_REQUEST){
													console.log('Establish connect');
													shipperInf._id = shipperInf._id.toString();

													var shipid = uuid.v1();
													var location = {
														latitude: shipper.location.coordinates[1],
														longitude: shipper.location.coordinates[0]
													}

													socket.emit('establish', {user: shipperInf, location: location, shipid: shipid});
													shipperSocket.emit('establish', {shipid: shipid});

													socket.data.state = consts.CODE.NORMAL_STATE;
													shipperSocket.data.state = consts.CODE.DRIVER_WAIT;
													socket.join(shipid);
													shipperSocket.join(shipid);

													var endPointsTemp = [];
													for(var i=0;i < endPoints.length; i++){
														endPointsTemp[i] = {
															coordinates: endPoints[i]
														}
													}

													app
														.get('models')
														.Ship
														.create({
															id: shipid,
															callerId: socket.data.userid,
															shipperId: shipperSocket.data.userid,
															createdAt: Date.now(),
															startPoint: {
																coordinates: startPoint
															},
															endPoints: endPointsTemp,
															moves: [location]
														})
														.then(function(r){
															console.log('Create ship: ', shipid);
														})
														.catch(function(e){
															console.error(e);
														});

													app
														.get('models')
														.Location
														.update({
															userid: shipper.userid,
															sid: shipper.sid
														},
														{
															status: 1
														})
														.then(function(r){
															console.log("Update status shipper when has established");
														})
														.catch(function(e){
															console.erorr(e);
														});
												}else{
													shipperSocket.data.state = consts.CODE.DRIVER_WAIT;
												}	

												stateSearch = 6;
												callback(null);
											})
											.catch(function(err){
												shipperSocket.data.state = consts.CODE.DRIVER_WAIT;
												console.error(err);
												stateSearch --;
												callback(null);
											});								
										}else{
											console.log('Shipper reject');
											shipperSocket.data.state = consts.CODE.DRIVER_WAIT;
											ignoreListReject.push(shipper.sid);
											stateSearch --;
											callback(null);
										}
									}
								});

								setTimeout(function(){
									console.log('Timeout');
									if(!timeout){
										timeout = true;
										shipperSocket.data.state = consts.CODE.DRIVER_WAIT;
										shipperSocket.removeAllListeners('have_client');
										if(!isRetry){
											ignoreListTimeout.push(shipper.sid);
										}else{
											ignoreListReject.push(shipper.sid);
										}
										stateSearch --;
										callback(null);
									}
								}, 17000);

							}else if(shipperSocket.data.state != consts.CODE.DRIVER_GET_REQUEST){
								stateSearch --; 
								ignoreListReject.push(shipper.sid);
							}
						})
						.catch(function(err){
							stateSearch --; 
							console.error(err);
							callback(null);
						});
					break;
				}else{
					stateSearch --; 
					ignoreListReject.push(shipper.sid); // push to reject
				}
			}

			if(i == numberShipper){
				stateSearch --; 
				callback(null); // next state search
			}
		}
				
	});

	

	function newEliminate(shippers, ignoreListReject, ignoreListTimeout, stateSearch, radius, shipType, isRetry){
		console.log('All shippers');
		console.log(shippers);
		console.log(ignoreListReject);
		console.log(ignoreListTimeout);
		console.log('--------------------');

		var shipperAfterIgnore = [];
		var lengthShippers = shippers.length;
		var lengthIgnoreReject = ignoreListReject.length;

		for(var i=0;i<lengthShippers; i++){
			var shipper = shippers[i];
			for(var j=0;j<lengthIgnoreReject;j++){
				if(shipper.sid == ignoreListReject[j]){
					break;
				}
			}
			if(j == lengthIgnoreReject){
				shipperAfterIgnore.push(shipper);
			}
		}
		console.log('After reject list');
		console.log(shipperAfterIgnore);
		console.log('--------------------');

		var shipperAfterTimeout = [];

		if(!isRetry){
			var lengthShipperAfterIgnore = shipperAfterIgnore.length;
			var lengthIgnoreTimeout = ignoreListTimeout.length;
			for(var i=0;i<lengthShipperAfterIgnore; i++){
				var shipper = shipperAfterIgnore[i];
				for(var j=0;j<lengthIgnoreTimeout;j++){
					if(shipper.sid == ignoreListTimeout[j]){
						break;
					}
				}
				if(j == lengthIgnoreTimeout){
					shipperAfterTimeout.push(shipper);
				}
			}
		}else{
			shipperAfterTimeout = shipperAfterIgnore;
		}

		console.log('After timeout list');
		console.log(shipperAfterTimeout);
		console.log('--------------------');

		var shipperValid = [];
		var shipperAvailable = shipperAfterTimeout;
		var lengthAvailble = shipperAvailable.length;

		if(stateSearch == 1){
			for(var i = 0;i < lengthAvailble; i++){
				var shipper = shipperAvailable[i];
				if( (shipper.status == 0) && (shipper.radius >= radius) && ( (shipper.shipType & shipType) == shipType)){
					shipperValid.push(shipper);
				}
			}
		} else if (stateSearch == 2){
			for(var i = 0;i < lengthAvailble; i++){
				var shipper = shipperAvailable[i];
				if( (shipper.status == 0) && (shipper.radius >= radius)){
					shipperValid.push(shipper);
				}
			}
		} else if (stateSearch == 3){
			for(var i = 0;i < lengthAvailble; i++){
				var shipper = shipperAvailable[i];
				if( (shipper.status == 0) && ( (shipper.shipType & shipType) == shipType)){
					shipperValid.push(shipper);
				}
			}
		} else if (stateSearch == 4){
			for(var i = 0;i < lengthAvailble; i++){
				var shipper = shipperAvailable[i];
				if( shipper.status == 0 ){
					shipperValid.push(shipper);
				}
			}
		}else if (stateSearch == 5){
			shipperValid = shipperAvailable;
			// sort
			var lengthValid = shipperValid.length;
			var listFree = [];
			var listShipping = [];
			for(var i=0; i < lengthValid; i++){
				if(shipperValid[i].status == 0){
					listFree.push(shipperValid[i]);
				}else {
					listShipping.push(shipperValid[i]);
				}
			}

			shipperValid = listFree.concat(listShipping);
		}

		console.log('After everything');
		console.log(shipperValid);
		console.log('--------------------');

		return shipperValid;
	}
}

function calculateRadius(startPoint, endPoints){
	if(endPoints.length == 0){
		return 1000;
	}
	var minimum = getDistanceFromLatLonInKm(startPoint.latitude, startPoint.longitude, endPoints[0].latitude, endPoints[0].longitude);
	for(var i=1; i < endPoints.length; i++){
		var newRadius = getDistanceFromLatLonInKm(startPoint.latitude, startPoint.longitude, endPoints[i].latitude, endPoints[i].longitude);
		if(newRadius < minimum){
			minimum = newRadius;
		}
	}

	return minimum;
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
