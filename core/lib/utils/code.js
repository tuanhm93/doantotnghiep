var app = require('express-singleton');
var consts = require('../consts/consts');
var bluebird = require('bluebird');
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport('smtps://hoangminhtuan.hust%40gmail.com:116101993@smtp.gmail.com');

var generateCodeAndSendToEmail = function(email){
	return app
				.get('models')
				.User 
				.findOne({email: email, accountType: consts.ACCOUNT_TYPE.NORMAL})
				.then(function(user){
					if(user){
						var code = generateCode();
						return app
									.get('models')
									.Code
									.findOneAndUpdate(
										{
											userid: user._id
										},
										{
											code: code,
											used: 0,
											createdAt: Date.now()
										},
										{
											upsert: true,
											new: true
										}
									)
									.then(function(r){
										console.log("Code: ", r);
										var mailOptions = {
										    from: '"iShip" <support@iship.com>', // sender address
										    to: email, // list of receivers
										    subject: 'Activate Your Account', // Subject line
										    html: 'Your code activate is: ' + code // html body
										};
										return transporter.sendMail(mailOptions);
									})
									.then(function(info){
										console.log('Send mail: ', info);
										return Promise.resolve(consts.CODE.SUCCESS);
									});
					}else{
						return Promise.resolve(consts.CODE.USER_NOT_EXIST);
					}
				});
}

function generateCode(){
	var code = "";
	for(var i=0;i<4;i++){
		code += Math.floor(Math.random()*10);
	}
	return code;
}

function verifyCode(code, email){
	return app
				.get('models')
				.User
				.findOne({email: email, accountType: consts.ACCOUNT_TYPE.NORMAL})
				.then(function(user){
					if(user){
						return app
									.get('models')
									.Code
									.findOneAndUpdate({userid: user._id, code: code}, {used: 1}, {new: false, upsert: false})
									.then(function(codeInf){
										if(codeInf){
											if(codeInf.used == 1){
												console.log('CODE_USED');
												return Promise.resolve(consts.CODE.CODE_USED);
											}else {
												if( (Date.now() - codeInf.createdAt) <= consts.CODE_TIME_EXPIRE){
													console.log('CODE_VALID');
													return Promise.resolve(consts.CODE.CODE_VALID);
												}else{
													console.log('CODE_EXPIRE');
													return Promise.resolve(consts.CODE.CODE_EXPIRE);
												}
											}
										}else{
											console.log('CODE_WRONG');
											return Promise.resolve(consts.CODE.CODE_WRONG);
										}
									});
					}else{
						return Promise.resolve(consts.CODE.USER_NOT_EXIST);
					}
				})
}

module.exports = {
	verifyCode: verifyCode,
	generateCodeAndSendToEmail: generateCodeAndSendToEmail,
	generateCode: generateCode
}

