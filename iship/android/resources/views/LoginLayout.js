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
} = React;

var ToolbarAndroid = require('ToolbarAndroid');
var FBLogin = require('react-native-facebook-login');
var FBLoginManager = require('NativeModules').FBLoginManager;
var ProgressBar = require('ProgressBarAndroid');
var loginFacebookUtil = require('../../../lib/utils/loginFacebook');
var loginNormalUtil = require('../../../lib/utils/login');
var validator = require('validator');
var Socket = require('../../../lib/socket/socket');

var LoginLayout = React.createClass({
	getInitialState: function(){
		console.log("LoginLayout: getInitialState");
		return {
			modalVisible: false,
			email: 'h@g.com',
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
						style={styles.facebook}
						onPress={this.loginFacebook} >
						<View style={styles.facebookLogoContainer}>
							<Image style={styles.facebookLogo} source={require('../../../public/images/logofacebook.png')} />
						</View>
						<View style={styles.facebookTextContainer}>
							<Text style={styles.facebookText}>Đăng nhập với facebook</Text>
						</View>
					</TouchableOpacity>


					<View style={styles.separate}>
						<Text style={styles.textSeparate}>---------------HOẶC---------------</Text>
					</View>

					<View style={styles.form}>
						<TextInput
							style={{height: 40, borderColor: 'gray'}}
							onChangeText={this.emailChange}
							value={this.state.email}
							placeholder="Email"

							keyboardType="email-address"
							onSubmitEditing={(event) => { 
								this.refs.hai.focus(); 
							}} />
						<Text style={styles.error}>{this.state.errorEmail}</Text>

						<TextInput
							ref = "hai"
							style={{height: 40, borderColor: 'gray'}}
							onChangeText={this.passwordChange}
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

	passwordChange(text){
		this.setState({password: text});
		if(validator.isLength(text, {min: 0, max: 5})){
			this.setState({errorPassword: '   Mật khẩu phải lớn hơn 6 ký tự'});
		}else{
			this.setState({errorPassword: ''});
		}
	},

	emailChange(text){
		this.setState({email: text});
		if(!validator.isEmail(text)){
			this.setState({errorEmail: '   Email không hợp lệ'});
		}else{
			this.setState({errorEmail: ''});
		}
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
		}
		if(!validator.isEmail(user.email)){
			valid = false;
			this.setState({errorEmail: '   Email không hợp lệ'})
		}
		if(valid){
			var _self = this;
			_self._setModalVisible(true);
			this.setState({loadingText: 'Đang đăng nhập'});
			loginNormalUtil.login(user)
			.then(function(result){
				_self._setModalVisible(true);
				var token = result.token;
				var socket = new Socket('', token);
				socket.connect(function(err, data){
					if(err){

					}else{
						// navigator.geolocation.getCurrentPosition(
						// 	(position) => {
						// 		_self._setModalVisible(false);
						// 		var latitude = position.coords.latitude;
						// 		var longitude = position.coords.longitude;
						// 		var route = {name: 'MainLayout', user: data, initialLocation: {latitude: latitude, longitude: longitude}};
						// 		_self.props.navigator.resetTo(route);
						// 	},
						// 	(error) =>{
						// 		_self._setModalVisible(false);
						// 		var route = {name: 'MainLayout', user: data, initialLocation: null};
						// 		_self.props.navigator.resetTo(route);
						// 	},
						// 		{enableHighAccuracy: false, timeout: 5000, maximumAge: 60000}
						// 	);

						_self._setModalVisible(false);
						var route = {name: 'MainLayout'};
						_self.props.navigator.resetTo(route);
					}
				});
			}).catch(function(err){
				console.log(err);
				_self._setModalVisible(false);
			});
		}
	},

	loginFacebook(){
		var _self = this;
		FBLoginManager.loginWithPermissions(["email","public_profile"], function(error, data){
			if (!error) {
				_self._setModalVisible(true);
				var accessToken = data.token;
				loginFacebookUtil.loginFacebook(accessToken)
				.then(function(result){
					var token = result.token;
					var socket = new Socket('', token);
					socket.connect(function(err, data){
						if(err){

						}else{
							_self._setModalVisible(false);
							var route = {name: 'MainLayout'}
							_self.props.navigator.resetTo(route);
						}
					});
				}).catch(function(err){
					_self._setModalVisible(false);
					console.error(err);
				});
			} else {
				Alert.alert(
					'Lỗi',
					'Đã có lỗi xảy ra vui lòng thử lại',
					[
						{text: 'OK'},
					]
				);
			}
		})
	}
});

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	toolbar: {
		height: 60,
		backgroundColor: "#1D8668"
	},
	facebook: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		height: 60,
		backgroundColor: 'rgb(66,93,174)',
	},
	facebookLogoContainer:{
		flex: 1,
		alignItems: "center",
		justifyContent: "center"
	},
	facebookTextContainer:{
		flex: 4,
		justifyContent: "center"
	},
	facebookLogo: {
		height: 30,
		width: 30,
	},
	facebookText: {
		color: '#ffffff',
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
		borderWidth: 1,
		borderColor: "#aaaaaa"
	},
	loginText: {
		color: "#ffffff",
		fontSize: 16,
		fontWeight: "600"
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