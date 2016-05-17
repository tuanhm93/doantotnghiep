var app = require('express-singleton');
var consts = require('../consts/consts');
var bluebird = require('bluebird');
var express = require('express');
var lodash = require('lodash');
var router = express.Router();
var validator = require('validator');
var userUtils = require('../utils/user');
var facebookUtils = require('../utils/facebook');
var tokenUtils = require('../utils/token');
var codeUtils = require('../utils/code');

router.post('/',
	function(req, res){
		console.log('reset-password: ', JSON.stringify(req.body));
		var email = req.body.email;
		var password = req.body.password;

		app
			.get('models')
			.User 
			.update(
				{
					email: email,
					accountType: consts.ACCOUNT_TYPE.NORMAL
				},
				{
					password: userUtils.hashPassword(password)
				}
			)
			.then(function(result){
				return res.json({code: consts.CODE.SUCCESS});
			})
			.catch(function(err){
				console.error(err);
				return res.json({code: consts.CODE.FAILD});
			});
	});



module.exports = function (app) {
	app.use('/reset-password', router);
};