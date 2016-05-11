/**
 * Created by tuanhm on 4/19/16.
 */

var connections = require('../selector/mongodb/mongodb');
var Schema = require('mongoose').Schema;

var SumRate = new Schema({
	userid: { type: Schema.Types.ObjectId},
	userType: {type: Number},
	stars: {type: Number},
	total: {type: Number},
	updatedAt: {type: Number}
});

SumRate.index({userid: 1, userType: 1});

module.exports = connections.getConnection('iship').model('SumRate', SumRate);