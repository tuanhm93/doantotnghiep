/**
 * Created by tuanhm on 4/19/16.
 */

var connections = require('../selector/mongodb/mongodb');
var Schema = require('mongoose').Schema;

var Location = new Schema({
	userid: { type: Schema.Types.ObjectId, required: true},
	sid: {type: String, required: true},
	location: {
		type: {type: String, default: 'Point'},
		coordinates: {type: [Number], require: true}
	}
});

Location.index({location: "2dsphere"});
Location.index({userid: 1});

module.exports = connections.getConnection('iship').model('Location', Location);