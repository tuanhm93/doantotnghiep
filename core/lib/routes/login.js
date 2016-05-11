var app = require('express-singleton');
var consts = require('../consts/consts');
var Promise = require('bluebird');
var express = require('express');
var lodash = require('lodash');
var router = express.Router();
var validator = require('validator');
var userUtils = require('../utils/user');
var facebookUtils = require('../utils/facebook');
var tokenUtils = require('../utils/token');

router.post('/',
	function(req, res){
		var type = req.body.type || '';

		if(type == consts.ACCOUNT_TYPE.NORMAL){
			loginNormal(req, res);
		}else if (type == consts.ACCOUNT_TYPE.FACEBOOK){
			loginFacebook(req, res);
		}else{
			res.json({code: consts.CODE.WRONG_PARAM});
		}

	});

function loginNormal(req, res){
	console.log("Login normal: ", req.body);
	var email = req.body.email || '';
	var password = req.body.password || '';

	if(!email || !password){
		return res.json({code: consts.CODE.WRONG_PARAM});
	}

	Promise
		.delay(0)
		.then(function(){
			return app	
						.get('models')
						.User
						.findOne({accountType: consts.ACCOUNT_TYPE.NORMAL ,email: email}, {_id: 1, password: 1});
		})
		.then(function(user){
			console.log("User: ", user);
			if(user){
				var passwordHash = userUtils.hashPassword(password);

				if(passwordHash == user.password){	
					var userid = user._id.toString();
					return tokenUtils.generateToken(userid)
				}else{
					return Promise.reject({code: consts.CODE.PASSWORD_WRONG});
				}
			}else{
				return Promise.reject({code: consts.CODE.ACCOUNT_NOT_EXIST});
			}
		})
		.then(function(token){
			res.json({code: consts.CODE.SUCCESS, token: token});
		})
		.catch(function(err){
			if(lodash.isError(err)){
				console.eror(err);
				res.json({code: consts.CODE.ERROR});
			}else{
				res.json(err);
			}
		});
}

function loginFacebook(req, res){
	var accessToken = req.body.accessToken || '';
	console.log("Login facebook: ", accessToken);

	if(!accessToken){
		return res.json({code: consts.CODE.WRONG_PARAM});
	}

	Promise
		.delay(0)
		.then(function(){
			return facebookUtils.getUserProfile(accessToken);
		})
		.then(function(userProfile){
			console.log(userProfile);
			var socialId = userProfile.id;
			req.userProfile = userProfile;
			return app
						.get('models')
						.User
						.findOne({socialId: socialId, accountType: consts.ACCOUNT_TYPE.FACEBOOK});
		})
		.then(function(r){
			if(r){
				var userid = r._id.toString();
				return userid;
			}else{
				var user = {
					username: req.userProfile.name || 'FACEBOOK USER',
					email: req.userProfile.email || '',
					phoneNumber: '',
					avatar: req.userProfile.picture.data.url || '',
					actived: 1,
					accountType: consts.ACCOUNT_TYPE.FACEBOOK,
					userType: consts.USER_TYPE.NON_SHIPPER,
					socialId: req.userProfile.id,
					createdAt: Date.now(),
					updatedAt: Date.now()
				}

				return app
							.get('models')
							.User
							.create(user)
							.then(function(r){
								return r._id.toString();
							});
			}
		})
		.then(function(userid){
			return tokenUtils.generateToken(userid);
		})
		.then(function(token){
			res.json({code: consts.CODE.SUCCESS, token: token});
		})
		.catch(function(err){
			console.error(err);
			res.json({code: consts.CODE.ERROR});
		})
}

module.exports = function (app) {
	app.use('/login', router);
};