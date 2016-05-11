/**
 * Created by tuanhm on 4/19/16.
 */

var connections = require('../selector/mongodb/mongodb');
var Schema = require('mongoose').Schema;

var Code = new Schema({
	userid: { type: Schema.Types.ObjectId, unique: true},
	userType: { type: Number},
	createdAt: {type: Number},
	code: {type: String},
	used: { type: Number}
});

module.exports = connections.getConnection('iship').model('Code', Code);