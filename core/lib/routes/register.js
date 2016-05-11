var app = require('express-singleton');
var consts = require('../consts/consts');
var bluebird = require('bluebird');
var express = require('express');
var lodash = require('lodash');
var router = express.Router();
var validator = require('validator');
var userUtils = require('../utils/user');
var tokenUtils = require('../utils/token');
var codeUtils = require('../utils/code');
router.post('/',
	function(req, res){
		var username = req.body.username || '';
		var password = req.body.password || '';
		var email = req.body.email || '';
		var phoneNumber = req.body.phoneNumber || '';

		if(!username || validator.isLength(password, {min: 0, max: 5}) || !validator.isEmail(email) || !validator.isMobilePhone(phoneNumber, 'vi-VN')){
			return res.json({code: consts.CODE.WRONG_PARAM});
		}

		app
			.get('models')
			.User
			.findOne({accountType: consts.ACCOUNT_TYPE.NORMAL ,email: email})
			.then(function(user){
				if(user){
					console.log("User exist: ", user._id);
					return Promise.reject({code: consts.CODE.EMAIL_EXIST});
				}else{
					var user = {
						username: username,
						email: email,
						avatar: '',
						password: userUtils.hashPassword(password),
						phoneNumber: phoneNumber,
						actived: 0,
						accountType: consts.ACCOUNT_TYPE.NORMAL,
						userType: consts.USER_TYPE.NORMAL,
						createdAt: Date.now(),
						updatedAt: Date.now()
					};
					return app
								.get('models')
								.User
								.create(user);
				}
			}).then(function(user){
				console.log("Created user: ", user._id);
				return tokenUtils.generateToken(user._id.toString());
			}).then(function(token){
				res.json({code: consts.CODE.SUCCESS, token: token});
				codeUtils.generateCodeAndSendToEmail(email)
				.then(function(code){
					console.log("SUCCESS: ", code);
				})
				.catch(function(err){
					console.error(err);
				});
			}).catch(function(err){
				if(lodash.isError(err)){
					console.log(err);
					res.json({code: consts.CODE.ERROR});
				}else{
					res.json(err);
				}
			});
	});

module.exports = function (app) {
	app.use('/register', router);
};