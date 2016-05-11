'use strict';

var React = require('react-native');
var {
	StyleSheet,
	View,
	Text,
	TouchableOpacity,
	TouchableHighlight,
	Image,
	Dimensions,
	Alert,
	Modal,
	TextInput,
	ScrollView,
	AsyncStorage,
} = React;

var ToolbarAndroid = require('ToolbarAndroid');
var FBLogin = require('react-native-facebook-login');
var FBLoginManager = require('NativeModules').FBLoginManager;
var ProgressBar = require('ProgressBarAndroid');
var loginFacebookUtil = require('../../../lib/utils/loginFacebook');
var loginNormalUtil = require('../../../lib/utils/login');
var validator = require('validator');
var Socket = require('../../../lib/socket/socket');
var consts = require('../../../lib/consts/consts');
var app = require('../../../lib/share/app.js');

var LoginLayout = React.createClass({
	getInitialState: function(){
		console.log("LoginLayout: getInitialState");
		return {
			modalVisible: false,
			email: 'hoangminhtuan.hust@gmail.com',
			password: '111111',
			errorEmail: '',
			errorPassword: '',
		}
	},
	render: function(){
		console.log("LoginLayout: render");
		return (
			<View style={styles.container}>
		        <ToolbarAndroid style={styles.toolbar}
			        navIcon={{uri: "android_back_white",isStatic: true}}
			        title="ĐĂNG NHẬP"
			        titleColor="#ffffff"
			        onIconClicked = {()=>this.props.navigator.pop()} />
				<ScrollView>        
					<TouchableOpacity
			          	style={styles.facebookLoginButton}
			          	onPress={this.onLoginFacebookPress}>
			          	<View style={styles.logoFB}>
		            		<Image style={styles.imageLogoFB} source={require('../../../public/images/logofacebook.png')} />
		            	</View>
		            	<View style={styles.textLoginFB}>
		            		<Text style={[styles.FBLoginButtonText]}>Đăng nhập với facebook</Text>
		            	</View>
		            	<View style={{width: 56}} />
			        </TouchableOpacity>



					<View style={styles.separate}>
						<Text style={styles.textSeparate}>---------------HOẶC---------------</Text>
					</View>

					<View style={styles.form}>
						<TextInput
							style={{height: 40, borderColor: 'gray'}}
							value={this.state.email}
							onChangeText={(text) => this.setState({email: text})}
							placeholder="Email"
							keyboardType="email-address"
							onSubmitEditing={(event) => { 
								this.refs.hai.focus(); 
							}} />
						<Text style={styles.error}>{this.state.errorEmail}</Text>

						<TextInput
							ref = "hai"
							style={{height: 40, borderColor: 'gray'}}
							onChangeText={(text) => this.setState({password: text})}
							value={this.state.password}
							placeholder="Mật khẩu"
							secureTextEntry = {true} />
						<Text style={styles.error}>{this.state.errorPassword}</Text>


						<TouchableOpacity
							onPress={this.login}
							style={styles.loginButton} >
							
							<Text style={styles.loginText}>ĐĂNG NHẬP</Text>
						
						</TouchableOpacity>
					</View>
				</ScrollView>
				
				<Modal
					visible={this.state.modalVisible}
					onRequestClose={()=>this._setModalVisible(false)} >

					<View style={styles.modalContainer} >
						<View style={styles.modalContent} >
							<ProgressBar styleAttr="Normal" />
							<Text>Đang đăng nhập</Text>
						</View>
					</View>
				</Modal>

			</View>
		);
	},

	_setModalVisible(visible) {
    	this.setState({modalVisible: visible});
  	},

	login(){
		var user = {
			email: this.state.email,
			password: this.state.password
		};
		var valid = true;
		if(validator.isLength(user.password, {min: 0, max: 5})){
			valid = false;
			this.setState({errorPassword: '   Mật khẩu phải lớn hơn 6 ký tự'})
		}else{
			this.setState({errorPassword: ''})
		}
		if(!validator.isEmail(user.email)){
			valid = false;
			this.setState({errorEmail: '   Email không hợp lệ'});
		}else{
			this.setState({errorEmail: ''})
		}
		if(valid){
			var _self = this;
			_self._setModalVisible(true);
			this.setState({loadingText: 'Đang đăng nhập'});
			loginNormalUtil.login(user)
				.then(function(result){
					_self._setModalVisible(false);
					if(result.code == consts.CODE.SUCCESS){
						var token = result.token;
						var socket = new Socket('', token);

						socket.connect(function(err, data){
							
							if(err){
								_self.alertError('Thông báo', 'Đã có lỗi xảy ra vui lòng thử lại!', 'OK');
							}else{
								data = data || {};

								if(data.code == consts.CODE.SUCCESS){
									var user = data.user;
										_self.alertError('Thông báo', JSON.stringify(user), 'OK');
									var route;
									if(user.userType == consts.USER_TYPE.ADMIN){
										route = {name: 'AdminLayout'};
									}else{
										if(user.actived == 0){
											route = {name: 'ActiveLayout', user: data.user};
										}else{
											route = {name: 'SwitchMode', user: data.user};
										}
									}
									_self.props.navigator.resetTo(route);
								}else{
									var socket = app.get('socket');
									socket.close();
									_self.alertError('Thông báo', 'Đã có lỗi xảy ra vui lòng thử lại!', 'OK');
								}
							}
						});
						AsyncStorage.setItem('token', token);
					}else if(result.code == consts.CODE.ACCOUNT_NOT_EXIST){
						_self.setState({
							errorEmail: '   Không tồn tại tài khoản với email này',
							password: ''
						});
					}else if(result.code == consts.CODE.PASSWORD_WRONG){
						_self.setState({
							errorPassword: '   Mật khẩu không chính xác',
							password: ''
						});
					}else{
						_self.alertError('Thông báo', 'Đã có lỗi xảy ra vui lòng thử lại!', 'OK');
					}
				}).catch(function(err){
					console.log(err);
					_self._setModalVisible(false);
					_self.alertError('Thông báo', 'Đã có lỗi xảy ra vui lòng thử lại!', 'OK');
				});
		}
	},
	alertError(title, body, buttonText){
		Alert.alert(
            title,
            body,
            [
              {text: buttonText},
            ]
        );
	},
	onLoginFacebookPress(){
		var _self = this;
		FBLoginManager.loginWithPermissions(["email","public_profile"], function(error, data){
			if (!error) {
				_self._setModalVisible(true);
				var accessToken = data.token;
				loginFacebookUtil.loginFacebook(accessToken)
					.then(function(result){
						_self._setModalVisible(false);
						if(result.code == consts.CODE.SUCCESS){
							var token = result.token;
							var socket = new Socket('', token);
							socket.connect(function(err, data){
								
								if(err){
									_self.alertError('Thông báo', 'Đã có lỗi xảy ra vui lòng thử lại!', 'OK');
								}else{
									data = data || {};
									if(data.code == consts.CODE.SUCCESS){
										var route = {name: 'MainLayout', user: data.user};
										_self.props.navigator.resetTo(route);
									}else{
										var socket = app.get('socket');
										socket.close();
										_self.alertError('Thông báo', 'Đã có lỗi xảy ra vui lòng thử lại!', 'OK');
									}
								}
							});
							AsyncStorage.setItem('token', token);
						} else {
							_self.alertError('Thông báo', 'Đã có lỗi xảy ra vui lòng thử lại!', 'OK');
						}
					}).catch(function(err){
						_self._setModalVisible(false);
						console.error(err);
						_self.alertError('Thông báo', 'Đã có lỗi xảy ra vui lòng thử lại!', 'OK');
					});
			} else {
				_self.alertError('Thông báo', 'Đã có lỗi xảy ra vui lòng thử lại!', 'OK');
			}
		})
	}
});

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	toolbar: {
		height: 56,
		backgroundColor: "#1D8668"
	},
	facebookLoginButton: {
	    height: 56,
	    flexDirection: 'row',
	    backgroundColor: 'rgb(66,93,174)',
	},
	logoFB:{
		width: 60,
		alignItems: "center",
		justifyContent: "center"
	},
	imageLogoFB: {
	    height: 30,
	    width: 30,
	},
	textLoginFB:{
		flex: 1,
		justifyContent: "center"
	},
	FBLoginButtonText: {
	    color: 'white',
	    fontWeight: '600',
	    fontFamily: 'Helvetica neue',
	    fontSize: 16,
	},
	separate:{
		marginTop: 10,
		marginBottom: 10,
		alignItems: "center"
	},
	textSeparate: {
		fontSize: 10
	},
	form: {
		paddingLeft: 20,
		paddingRight: 20
	},
	loginButton:{
		marginTop: 10,
		alignItems: "center",
		justifyContent: "center",
		height: 50,
		backgroundColor: "#1D8668",
		borderRadius: 2,
	},
	loginText: {
		color: "#ffffff",
		fontSize: 17,
	},
	error:{
		marginLeft: 2,
		color: "#e74c3c"
	},
	modalContainer: {
		flex:1,
		alignItems: "center",
		justifyContent: "center",
	},
	modalContent: {
		alignItems: "center",
		justifyContent: "center",
		width: 250,
		height: 100,
		backgroundColor: "#ffffff",
		borderRadius: 3
	},
});


module.exports = LoginLayout;