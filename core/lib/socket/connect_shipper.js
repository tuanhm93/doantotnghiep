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
	socket.on('connect_shipper', function(data){
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
}