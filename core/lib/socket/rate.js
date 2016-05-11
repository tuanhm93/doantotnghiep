var app = require('express-singleton');
var consts = require('../consts/consts');

module.exports = function(socket){
	socket.on('rate', function(data){
		console.log(JSON.stringify(data));
		var userid = socket.data.userid;
		var ratedId = data.userid;
		var shipid = data.shipid;
		var stars = data.star;
		var type = data.type;
		var rateType = (type == consts.USER_TYPE.SHIPPER ? type : consts.USER_TYPE.NON_SHIPPER);

		app
			.get('models')
			.Rate 
			.create({
				rate: userid,
				rated: ratedId,
				shipid: shipid,
				stars: stars,
				rateType: rateType,
				createdAt: Date.now()
			})
			.then(function(r){
				console.log('Create rate: ', r);
			})
			.catch(function(e){
				console.error(e);
			});

		app
			.get('models')
			.SumRate
			.findOne({userid: ratedId, userType: rateType})
			.then(function(r){
				if(r){
					var oldStar = r.stars;
					var total = r.total;
					var newStar = (oldStar*total + stars)/(total+1);
					return app
								.get('models')
								.SumRate
								.update({
									userid: ratedId,
									userType: rateType
								}, {
									stars: newStar,
									total: total + 1,
									updatedAt: Date.now()
								});
				}else{
					return app
								.get('models')
								.SumRate
								.create({
									userid: ratedId,
									userType: rateType,
									stars: stars,
									total: 1,
									updatedAt: Date.now()
								});
				}
			})
			.then(function(r){
				console.log('Update rate stars: ', r);
			})
			.catch(function(e){
				console.error(e);
			});
	});
}