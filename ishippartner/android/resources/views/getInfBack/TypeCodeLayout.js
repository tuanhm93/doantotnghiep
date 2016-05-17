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

var UserProfileLayout = React.createClass({
	getInitialState: function(){
		return {
			email: this.props.email,
			code: '',
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
						<Text style={styles.titleText}>Vui lòng nhập mã code tài khoản của bạn</Text>
					</View>

					<View style={styles.form}>
						<View style={{justifyContent: 'center', alignItems: 'center'}}>
							<Text style={styles.error}>{this.state.error}</Text>
						</View>
						<View style={{justifyContent: 'center', alignItems: 'center'}}>
						<TextInput
							style={{width: 60}}
							value={this.state.code}
							onChangeText={(text) => this.setState({code: text})}
							maxLength = {4}
					    	placeholder="XXXX"
					    	autoFocus = {true}
							placeholderTextColor="#7f8c8d"
							keyboardType="numeric" />
						</View>

						<TouchableOpacity
							onPress={this.onEmailPress}
							style={styles.emailButton} >
							
							<Text style={styles.emailText}>TIẾP TỤC</Text>
						
						</TouchableOpacity>

						<TouchableOpacity
							style={styles.resendButton}
							onPress={this.onResendPress}>
							<Text style={styles.resendText}>Gửi lại mã code</Text>
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
		if(!validator.isNumeric(this.state.code) || (this.state.code.length != 4)){
			valid = false;
			_self.setErrorText('Mã code gồm 4 ký tự chữ số');
		}else {
			if(this.state.error != ''){
				_self.setErrorText('');
			}
		}

		if(valid){
			this._setModalVisible(true);
			activeUtils
			.active(this.state.code, this.state.email)
			.then(function(result){
				_self._setModalVisible(false);
				if(result.code == consts.CODE.SUCCESS){
					var route = {name: 'TypeNewPassword', email: _self.state.email};
					_self.props.navigator.push(route);
				}else if(result.code == consts.CODE.FAILD){
					if(result.status == consts.CODE.CODE_WRONG){
						_self.setErrorText('Mã code không chính xác');
					}else if (result.status == consts.CODE.CODE_EXPIRE){
						_self.setErrorText('Mã code đã hết hiệu lực');
					}else if (result.status == consts.CODE.CODE_USED){
						_self.setErrorText('Mã code đã được sử dụng');
					}
				}
			})
			.catch(function(err){
				_self._setModalVisible(false);
				_self.alertError('Thông báo', JSON.stringify(err), 'OK');
				// _self.alertError('Thông báo', 'Đã có lỗi xảy ra vui lòng thử lại!', 'OK');
			});
		}
	},
	onResendPress: function(){
		this._setModalVisible(true);
		var _self = this;
		activeUtils
			.resendCode(this.state.email)
			.then(function(result){
				_self._setModalVisible(false);
				if(result.code == consts.CODE.SUCCESS){
					_self.setErrorText('Vui lòng vào email để lấy mã xác thực');
				}else if(result.code == consts.CODE.FAILD){
					_self.alertError('Thông báo', 'Đã có lỗi xảy ra vui lòng thử lại!', 'OK');
				}
			})
			.catch(function(err){
				_self._setModalVisible(false);
				_self.alertError('Thông báo', 'Đã có lỗi xảy ra vui lòng thử lại!', 'OK');
			});
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