/**
 * Created by tuanhm on 4/19/16.
 */

var connections = require('../selector/mongodb/mongodb');
var Schema = require('mongoose').Schema;

var User = new Schema({
	username: { type: String, required: true},
	email: { type: String, default: ''},
	avatar: { type: String, default: '' },
	phoneNumber: { type: String, default: ''},
	password: {type: String},
	actived: {type: Number, default: 0},
	accountType: {type: Number, required: true},
	userType: {type: Number, required: true},
	socialId: {type: String},
	createdAt: {type: Number, required: true},
	updatedAt: {type: Number, required: true}
});

User.index({email: 1});
User.index({accountType: 1});
User.index({socialId: 1});

module.exports = connections.getConnection('iship').model('User', User);