'use strict';

var React = require('react-native');

var {
	StyleSheet,
  	View,
  	Text,
  	TouchableOpacity,
  	Image,
  	Dimensions,
  	Alert,
  	Modal,
  	TextInput,
  	ScrollView,
  	AsyncStorage
} = React;

var FBLogin = require('react-native-facebook-login');
var FBLoginManager = require('NativeModules').FBLoginManager;
var ProgressBar = require('ProgressBarAndroid');
var loginFacebookUtil = require('../../../lib/utils/loginFacebook');
var registerUtil = require('../../../lib/utils/register');
var validator = require('validator');
var ToolbarAndroid = require('ToolbarAndroid');
var Socket = require('../../../lib/socket/socket.js');
var consts = require('../../../lib/consts/consts.js');

var RegisterLayout = React.createClass({
	getInitialState: function(){
		return {
			modalVisible: false,
      		username: '',
      		password: '',
      		phoneNumber: '',
      		email: '',
      		loadingText: '',
      		textErrorUsername :'',
      		textErrorPassword: '',
      		textErrorPhoneNumber: '',
      		textErrorEmail : ''
		}
	},
	_setModalVisible: function(value){
		this.setState({
			modalVisible: value
		});
	},

	render: function() {
	    return (
	      	<View style={styles.container}>
		      	<ToolbarAndroid style={{backgroundColor: "#1D8668", height: 56}}
			        navIcon={{uri: "android_back_white",isStatic: true}}
			        title="ĐĂNG KÝ"
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
					    onChangeText={(text) => this.setState({username: text})}
					    value={this.state.username}
					    placeholder="Họ và tên"
					    autoCapitalize="words"
					    onSubmitEditing={(event) => { 
						    this.refs.hai.focus(); 
						}} />
					<Text style={styles.error}>{this.state.textErrorUsername}</Text>

					<TextInput
						ref='hai'
					    style={{height: 40, borderColor: 'gray'}}
					    onChangeText={(text) => this.setState({email: text})}
					    value={this.state.email}
					    placeholder="Email"
					    keyboardType="email-address"
					    onSubmitEditing={(event) => { 
						    this.refs.ba.focus(); 
						}} />
					<Text style={styles.error}>{this.state.textErrorEmail}</Text>

					<TextInput
						ref='ba'
					    style={{height: 40, borderColor: 'gray'}}
					    onChangeText={(text) => this.setState({password: text})}
					    value={this.state.password}
					    placeholder="Mật khẩu"
					   	secureTextEntry = {true}
					   	onSubmitEditing={(event) => { 
						    this.refs.bon.focus(); 
						}} />
					<Text style={styles.error}>{this.state.textErrorPassword}</Text>

					<TextInput
						ref='bon'
						onChangeText={(text) => this.setState({phoneNumber: text})}
					    style={{height: 40, borderColor: 'gray'}}
					    value={this.state.phoneNumber}
					    placeholder="Số điện thoại"
					    keyboardType="numeric" />
					<Text style={styles.error}>{this.state.textErrorPhoneNumber}</Text>

					<TouchableOpacity
			          	onPress={this.onRegisterPress}
			          	style={{marginTop: 10}}>
			          	<View style={styles.registerButton}>
			           		<Text style={styles.registerText}>TIẾP TỤC</Text>
			          	</View>
			        </TouchableOpacity>

		    	</View>
		    </ScrollView>
				<Modal 
					visible={this.state.modalVisible}
					onRequestClose={()=>this._setModalVisible(false)}>
				    	<View style={styles.loadingContainer}>
				    		<View style={styles.contentLoading}>
						    	<ProgressBar styleAttr="Normal" />
						    	<Text>{this.state.loadingText}</Text>
						    </View>
				    	</View>
				 </Modal>
		   </View>
	    );
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
  	onLoginFacebookPress: function(){
  		var _self = this;

	  	FBLoginManager.loginWithPermissions(["email","public_profile"], function(error, data){
		  	if (!error) {
		  		_self._setModalVisible(true);
			  	_self.setState({loadingText: 'Đang đăng nhập'});
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
		});
	},

	onRegisterPress: function(){
		var user = {
			username: this.state.username,
			password: this.state.password,
			email: this.state.email,
			phoneNumber: this.state.phoneNumber
		}

		var valid = true;
		if(user.username == ''){
			valid = false;
			this.setState({textErrorUsername: '   Họ và tên không được để trống'})
		}else{
			this.setState({textErrorUsername: ''});
		}

		if(validator.isLength(user.password, {min: 0, max: 5})){
			valid = false;
			this.setState({textErrorPassword: '   Mật khẩu phải lớn hơn 6 ký tự'})
		}else{
			this.setState({textErrorPassword: ''});
		}

		if(!validator.isEmail(user.email)){
			valid = false;
			this.setState({textErrorEmail: '   Email không hợp lệ'})
		}else{
			this.setState({textErrorEmail: ''});
		}

		if(!validator.isMobilePhone(user.phoneNumber, 'vi-VN')){
			valid = false;
			this.setState({textErrorPhoneNumber: '   Số điện thoại không hợp lệ'})
		}else{
			this.setState({textErrorPhoneNumber: ''});
		}

		if(valid){
			var _self = this;
			this._setModalVisible(true);
			this.setState({loadingText: 'Đang đăng ký'});
			registerUtil.register(user)
				.then(function(result){
					console.log(result);
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
									
									var route;
									if(user.userType == consts.USER_TYPE.ADMIN){
										route = {name: 'AdminLayout'};
									}else{
										if(user.actived == 0){
											route = {name: 'ActiveLayout', user: data.user};
										}else{
											route = {name: 'MainLayout', user: data.user};
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
					} else if(result.code == consts.CODE.EMAIL_EXIST) {
						_self.setState({
							textErrorEmail: '   Email này đã được sử dụng',
							password: ''
						});
					} else {
						_self.alertError('Thông báo', 'Đã có lỗi xảy ra vui lòng thử lại!', 'OK');
					}
				}).catch(function(err){
					console.error(err);
					_self._setModalVisible(false);
					_self.alertError('Thông báo', 'Đã có lỗi xảy ra vui lòng thử lại!', 'OK');
				});
		}
	}
});

const styles = StyleSheet.create({
	container: {
	    flex: 1,
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
	loadingContainer: {
	  	flex:1,
	  	alignItems: "center",
	  	justifyContent: "center",
	},
	contentLoading: {
	  	alignItems: "center",
	  	justifyContent: "center",
	  	alignSelf: "stretch",
	  	marginLeft: 50,
	  	marginRight: 50,
	  	height: 100,
	  	backgroundColor: "#ffffff",
	  	borderRadius: 3
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
	registerButton:{
		alignItems: "center",
		alignSelf: "stretch",
		justifyContent: "center",
		height: 50,
		backgroundColor: "#1D8668",
		borderRadius: 2
	},
	registerText: {
		color: "#ffffff",
		fontSize: 17,
	},
	error:{
		color: "#e74c3c",
		marginLeft: 2,
	}

});


module.exports = RegisterLayout;