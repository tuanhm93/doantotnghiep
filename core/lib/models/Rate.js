/**
 * Created by tuanhm on 4/19/16.
 */

var connections = require('../selector/mongodb/mongodb');
var Schema = require('mongoose').Schema;

var Rate = new Schema({
	rate: { type: Schema.Types.ObjectId},
	rated: { type: Schema.Types.ObjectId },
	rateType: {type: Number},
	shipid: { type: String},
	stars: {type: Number},
	createdAt: {type: Number}
});

Rate.index({rate: 1});
Rate.index({rated: 1});

module.exports = connections.getConnection('iship').model('Rate', Rate);