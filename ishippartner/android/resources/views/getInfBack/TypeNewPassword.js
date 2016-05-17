"use strict";

var React = require('react-native');

var {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	ListView,
	ScrollView,
	Image,
	Modal,
	TextInput,
	Alert
} = React;

var Icon = require('react-native-vector-icons/Ionicons');
var ProgressBar = require('ProgressBarAndroid');
var MyToolBar = require('../MyToolBar.js');
var validator = require('validator');
var app = require('../../../../lib/share/app');
var activeUtils = require('../../../../lib/utils/active.js');
var consts = require('../../../../lib/consts/consts');
var checkEmailUtils = require('../../../../lib/utils/checkEmail.js');

var UserProfileLayout = React.createClass({
	getInitialState: function(){
		return {
			email: this.props.email,
			password: '',
			retypePassword: '',
			error: '',
			modalVisible: false
		}
	},
	componentDidMount: function(){
		
	},
	componentWillUnmount: function(){
		
	},
	render: function(){
		return (
			<View style={{flex: 1}}>
				<MyToolBar
					style={{backgroundColor: "#2c3e50", height: 56}}
					title={"LẤY LẠI THÔNG TIN"}
					icon={"android-arrow-back"}
					onPress={this.onPressBack} >
				</MyToolBar>
				<View style={styles.body}>
					<View style = {styles.title}>
						<Text style={styles.titleText}>Vui lòng nhập mật khẩu mới cho tài khoản của bạn</Text>
					</View>

					<View style={styles.form}>
						<View style={{justifyContent: 'center', alignItems: 'center'}}>
							<Text style={styles.error}>{this.state.error}</Text>
						</View>
						<TextInput

							value={this.state.password}
							onChangeText={(text) => this.setState({password: text})}
					    	placeholder="Mật khẩu"
					    	autoFocus = {true}
							placeholderTextColor="#7f8c8d"
							secureTextEntry = {true}
							/>
						<TextInput
							value={this.state.retypePassword}
							onChangeText={(text) => this.setState({retypePassword: text})}
					    	placeholder="Nhập lại mật khẩu"
							placeholderTextColor="#7f8c8d"
							secureTextEntry = {true}
							/>


						<TouchableOpacity
							onPress={this.onEmailPress}
							style={styles.emailButton} >
							
							<Text style={styles.emailText}>XÁC NHẬN</Text>
						
						</TouchableOpacity>

					</View>
				</View>

				<Modal
					visible={this.state.modalVisible}
					onRequestClose={()=>this._setModalVisible(false)} >

					<View style={styles.modalContainer} >
						<View style={styles.modalContent} >
							<ProgressBar styleAttr="Normal" />
							<Text>Đang xử lý</Text>
						</View>
					</View>
				</Modal>

			</View>
		);
	},
	onPressBack: function(){
		this.props.navigator.pop();
	},
	_setModalVisible: function(value){
		this.setState({
			modalVisible: value
		})
	},
	onEmailPress: function(){
		var _self = this;
		var valid = true;
		var password = this.state.password;
		var retypePassword = this.state.retypePassword;

		if(validator.isLength(password, {min: 0, max: 5})){
			valid = false;
			this.setErrorText('Mật khẩu phải lớn hơn 6 ký tự');
		} else {
			if(password != retypePassword){
				valid = false;
				this.setErrorText('Mật khẩu không trùng nhau');
			}else {
				this.setErrorText('');
			}
		}

		if(valid){
			checkEmailUtils.
			resetPassword(password, this.state.email)
			.then(function(result){
				if(result.code == consts.CODE.SUCCESS){
					var routes = [
						{'name': 'WelcomeLayout'},
						{'name': 'LoginLayout', 'email': _self.state.email}
					];

					_self.props.navigator.immediatelyResetRouteStack(routes);
				}else{
					_self.alertError('Thông báo', 'Đã có lỗi xảy ra vui lòng thử lại!', 'OK');
				}
			})
			.catch(function(err){
				_self.alertError('Thông báo', 'Đã có lỗi xảy ra vui lòng thử lại!', 'OK');
			})
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
	setErrorText(text){
		this.setState({
			error: text
		})
	}
});


const styles = StyleSheet.create({
	body: {
		flex: 1,
		paddingTop: 20,
		backgroundColor: "#34495e",
		paddingLeft: 20,
		paddingRight: 20
	},
	titleText:{
		color: "#ecf0f1",
		fontSize: 15,
		fontWeight: "bold",
		textAlign: 'center'
	},
	error:{
		marginLeft: 2,
		color: "#e74c3c"
	},
	modalContainer:{
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center'
	},
	emailButton:{
		marginTop: 10,
		height: 40,
		borderRadius: 3,
		backgroundColor: "#ecf0f1",
		justifyContent: 'center',
		alignItems: 'center'
	},
	emailText: {
		color: "#7f8c8d",
		fontSize: 17
	},
	resendButton:{
		marginTop: 5,
		alignItems: "flex-end"
	},
	resendText:{
		fontSize: 15,
		color: "#2980b9"
	}
});

module.exports = UserProfileLayout;