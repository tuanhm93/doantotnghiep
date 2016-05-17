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
		console.log('Check-email: ', req.body.email);
		var email = req.body.email;
		if(!validator.isEmail(email)){
			return res.json({code: consts.CODE.WRONG_PARAM});
		}

		app
			.get('models')
			.User 
			.findOne({email: email, accountType: consts.ACCOUNT_TYPE.NORMAL})
			.then(function(user){
				console.log(user);
				if (user){
					return res.json({code: consts.CODE.SUCCESS});
				} else {
					return res.json({code: consts.CODE.FAILD, status: consts.CODE.ACCOUNT_NOT_EXIST});
				}
			})
			.catch(function(err){
				console.error(err);
				return res.json({code: consts.CODE.ERROR});
			});
	});



module.exports = function (app) {
	app.use('/check-email', router);
};