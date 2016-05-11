'use strict';

import React, {
  StyleSheet,
  View,
  Text,
  TouchableHighlight,
  Image,
  Dimensions,
  Alert,
  Modal,
  TextInput,
} from 'react-native';

var FBLogin = require('react-native-facebook-login');
var FBLoginManager = require('NativeModules').FBLoginManager;
var ProgressBar = require('ProgressBarAndroid');
var loginFacebookUtil = require('../../../lib/utils/loginFacebook');
var registerUtil = require('../../../lib/utils/register');
var validator = require('validator');

class RegisterLayout extends React.Component {
constructor(props) {
    super(props); 
    this.state = {
      loading: false,
      username: '',
      password: '',
      phoneNumber: '',
      email: '',
      loadingText: '',
      'errorUsername' :'',
      'errorPassword': '',
      'errorPhoneNumber': '',
      'errorEmail' : ''
    };
  }

  render() {
    return (
      <View style={styles.container}>
      	<View style={styles.facebook}>
	        <TouchableHighlight
	          style={styles.container}
	          onPress={this.loginFacebook.bind(this)}
	        >
	          <View style={styles.FBLoginButton}>
	            <Image style={styles.FBLogo} source={require('../../../public/images/logofacebook.png')} />
	            <Text style={[styles.FBLoginButtonText]}
	              numberOfLines={1}>Đăng nhập với facebook</Text>
	          </View>
	        </TouchableHighlight>
	    </View>
	    <View style={styles.separate}>
	    	<Text style={styles.textSeparate}>---------------HOẶC---------------</Text>
	    </View>
	    <View style={styles.form}>

	    	<TextInput
			    style={{height: 40, borderColor: 'gray'}}
			    onChangeText={this.usernameChange.bind(this)}
			 
			    value={this.state.username}
			    placeholder="Họ và tên"
			    autoCapitalize="words"
			    onSubmitEditing={(event) => { 
				    this.refs.hai.focus(); 
				  }}

			  />
			<Text style={styles.error}>{this.state.errorUsername}</Text>
			<TextInput
				ref='hai'
			    style={{height: 40, borderColor: 'gray'}}
			    onChangeText={this.emailChange.bind(this)}
			    value={this.state.email}
			    placeholder="Email"
			    keyboardType="email-address"
			    onSubmitEditing={(event) => { 
				    this.refs.ba.focus(); 
				  }}
			  />
			<Text style={styles.error}>{this.state.errorEmail}</Text>
			<TextInput
				ref='ba'
			    style={{height: 40, borderColor: 'gray'}}
			    onChangeText={this.passwordChange.bind(this)}
			    value={this.state.password}
			    placeholder="Mật khẩu"
			   secureTextEntry = {true}
			   onSubmitEditing={(event) => { 
				    this.refs.bon.focus(); 
				  }}
			  />
			<Text style={styles.error}>{this.state.errorPassword}</Text>
			<TextInput
			ref='bon'
			    style={{height: 40, borderColor: 'gray'}}
			    onChangeText={this.phoneNumberChange.bind(this)}
			    value={this.state.phoneNumber}
			    placeholder="Số điện thoại"
			    keyboardType="numeric"
			  />
			<Text style={styles.error}>{this.state.errorPhoneNumber}</Text>

			<TouchableHighlight
	          onPress={this.register.bind(this)}
	          style={{marginTop: 10}}>
	          <View style={styles.registerButton}>
	           <Text style={styles.registerText}
	              numberOfLines={1}>TIẾP TỤC</Text>
	          </View>
	        </TouchableHighlight>

	    </View>
		<Modal visible={this.state.loading}
		    	>
		    	<View style={styles.loadingContainer}>
		    		<View style={styles.contentLoading}>
				    	<ProgressBar styleAttr="Normal" />
				    	<Text>{this.state.loadingText}</Text>
				    </View>
		    	</View>
		 </Modal>
		
	   </View>
    );
  }
  usernameChange(text){
  	this.setState({username: text});
  	if(text == ''){
  		this.setState({errorUsername: '   Họ và tên không được để trống'});
  	}else{
  		this.setState({errorUsername: ''});
  	}
  }
  passwordChange(text){
  	this.setState({password: text});
  	if(validator.isLength(text, {min: 0, max: 5})){
  		this.setState({errorPassword: '   Mật khẩu phải lớn hơn 6 ký tự'});
  	}else{
  		this.setState({errorPassword: ''});
  	}
  }
  emailChange(text){
  	this.setState({email: text});
  	if(!validator.isEmail(text)){
  		this.setState({errorEmail: '   Email không hợp lệ'});
  	}else{
  		this.setState({errorEmail: ''});
  	}
  }
  phoneNumberChange(text){
  	this.setState({phoneNumber: text});
  	if(!validator.isMobilePhone(text, 'vi-VN')){
  		this.setState({errorPhoneNumber: '   Số điện thoại không hợp lệ'});
  	}else{
  		this.setState({errorPhoneNumber: ''});
  	}
  }
  loginFacebook(){
  	var _self = this;
	  FBLoginManager.loginWithPermissions(["email","public_profile"], function(error, data){
		  if (!error) {

		  	_self.setState({loadingText: 'Đang đăng nhập', loading: true});
		    var accessToken = data.token;
		    loginFacebookUtil.loginFacebook(accessToken)
		    	.then(function(result){
		    		var socketManager = require('../../../lib/socket/socketManager');
		    		socketManager(result.token, _self.props.navigator, _self);
		    	}).catch(function(err){
		    		_self.setState({loading: false});
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

	register(){
		var user = {
			username: this.state.username,
			password: this.state.password,
			email: this.state.email,
			phoneNumber: this.state.phoneNumber
		}
		var valid = true;
		if(user.username == ''){
			valid = false;
			this.setState({errorUsername: '   Họ và tên không được để trống'})
		}
		if(validator.isLength(user.password, {min: 0, max: 5})){
			valid = false;
			this.setState({errorPassword: '   Mật khẩu phải lớn hơn 6 ký tự'})
		}
		if(!validator.isEmail(user.email)){
			valid = false;
			this.setState({errorEmail: '   Email không hợp lệ'})
		}
		if(!validator.isMobilePhone(user.phoneNumber, 'vi-VN')){
			valid = false;
			this.setState({errorPhoneNumber: '   Số điện thoại không hợp lệ'})
		}
		if(valid){
			var _self = this;
			this.setState({loadingText: 'Đang đăng ký', loading: true});
			registerUtil.register(user)
				.then(function(result){
					var socketManager = require('../../../lib/socket/socketManager');
		    		socketManager(result.token, _self.props.navigator, _self);
				}).catch(function(err){
					console.error(err);
					_self.setState({loading: false});
				});
		}
	}
}
var width = Dimensions.get('window').width; //full width
var height = Dimensions.get('window').height; //full width
const styles = StyleSheet.create({
	container: {
	    flex: 1,
	  },
	  FBLoginButton: {
	    flex: 1,
	    flexDirection: 'row',
	    alignItems: 'center',
	    justifyContent: 'center',

	    height: 60,
	    width: width,
	    paddingLeft: 2,

	    backgroundColor: 'rgb(66,93,174)',
	    
	    borderWidth: 1,
	    borderColor: 'rgb(66,93,174)',

	    shadowColor: "#000000",
	    shadowOpacity: 0.8,
	    shadowRadius: 2,
	    shadowOffset: {
	      height: 1,
	      width: 0
	    },
	  },
	  FBLoginButtonText: {
	    color: 'white',
	    fontWeight: '600',
	    fontFamily: 'Helvetica neue',
	    fontSize: 16,
	  },
	  FBLogo: {
	    position: 'absolute',
	    height: 30,
	    width: 30,
	    left: 15,
	    top: 15,
	  },
	  loadingContainer: {
	  	flex:1,
	  	alignItems: "center",
	  	justifyContent: "center",
	  },
	  contentLoading: {
	  	alignItems: "center",
	  	justifyContent: "center",
	  	width: 250,
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
	  	borderRadius: 3
	  },
	  registerText: {
	  	color: "#ffffff",
	  	fontSize: 16,
	  	fontWeight: "600"
	  },
	  error:{
	  	color: "#e74c3c",
	  	marginLeft: 2,
	  }
	  
});


module.exports = RegisterLayout;