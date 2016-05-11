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
		var code = req.body.code;
		var email = req.body.email;

		if(!code || !validator.isEmail(email)){
			return res.json({code: consts.CODE.WRONG_PARAM});
		}

		codeUtils.verifyCode(code, email)
		.then(function(code){
			if(code == consts.CODE.CODE_VALID){
				return app
							.get('models')
							.User 
							.update({
								email: email,
								userType: consts.USER_TYPE.NORMAL
							}, {
								actived: 1
							});
			}else{
				return Promise.reject({code: consts.CODE.FAILD, status: code});
			}
		})
		.then(function(r){
			console.log('Active: ', r);
			res.json({code: consts.CODE.SUCCESS});
		})
		.catch(function(err){
			if(lodash.isError(err)){
				console.error(err);
				return res.json({code: consts.CODE.ERROR});
			}
			res.json(err);
		});
	});



module.exports = function (app) {
	app.use('/active', router);
};