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
		console.log('Resend code');
		var email = req.body.email;

		if(!validator.isEmail(email)){
			return res.json({code: consts.CODE.WRONG_PARAM});
		}

		codeUtils.generateCodeAndSendToEmail(email)
		.then(function(code){
			if(code == consts.CODE.SUCCESS){
				res.json({code: code});
			}else{
				res.json({code: consts.CODE.FAILD, status: code});
			}
		})
		.catch(function(err){
			res.json({code: consts.CODE.ERROR});
		});
	});



module.exports = function (app) {
	app.use('/resendcode', router);
};