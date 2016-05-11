/**
 * Created by tuanhm on 4/19/16.
 */

var connections = require('../selector/mongodb/mongodb');
var Schema = require('mongoose').Schema;

var Coordinate = new Schema({
	latitude: {type: Number},
	longitude: {type: Number}
});

var Point = new Schema({
	type: {type: String, default: 'Point'},
	coordinates: {type: Coordinate}
});

var Ship = new Schema({
	id: { type: String},
	callerId: {type: Schema.Types.ObjectId},
	shipperId: {type: Schema.Types.ObjectId},
	createdAt: {type: Number}, 
	arrivedAt: {type: Number},
	startedAt: {type: Number},
	endedAt: {type: Number},
	startPoint: {type: Point},
	endPoints: {type: [Point]},
	moves: {type: [Coordinate]},
	status: {type: Number, default: 0} // 0 not finish, 1 finish success, 2 finish with caller reject, 3 finish with shipper reject
});

Ship.index({id: 1});
Ship.index({callerId: 1});
Ship.index({shipperId: 1});

module.exports = connections.getConnection('iship').model('Ship', Ship);