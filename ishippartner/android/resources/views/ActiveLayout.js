"use strict";

var React = require('react-native');

var {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	TextInput,
	Modal,
	Alert
} = React;
var ProgressBar = require('ProgressBarAndroid');
var validator = require('validator');
var activeUtils = require('../../../lib/utils/active.js');
var consts = require('../../../lib/consts/consts.js');

var ActiveLayout = React.createClass({
	getInitialState: function(){
		return {
			user: this.props.user,
			code: '',
			modalVisible: false,
			codeError: '',
		};
	},

	componentWillReceiveProps: function(newProps){
		
	},
	onActivePress: function(){
		var _self = this;
		var valid = true;
		if(!validator.isNumeric(this.state.code) || (this.state.code.length != 4)){
			valid = false;
			this.setState({
				codeError: 'Mã code gồm 4 ký tự chữ số'
			});
		}

		if(valid){
			this._setModalVisible(true);
			activeUtils
			.active(this.state.code, this.state.user.email)
			.then(function(result){
				_self._setModalVisible(false);
				if(result.code == consts.CODE.SUCCESS){
					var route = {name: 'MainLayout', user: _self.state.user};
					_self.props.navigator.resetTo(route);
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
	setErrorText(text){
		this.setState({
			codeError: text
		})
	},
	onResendPress: function(){
		this._setModalVisible(true);
		var _self = this;
		activeUtils
			.resendCode(this.state.user.email)
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
	_setModalVisible: function(value){
		this.setState({modalVisible: value});
	},
	render: function(){
		return (
			<View style={styles.container}>
				<View style={styles.toolbar}>
					<Text style={styles.titleToolbar}>XÁC THỰC TÀI KHOẢN</Text>
				</View>
				<View style={styles.body}>
					<Text style={styles.bodyTitle}>Vui lòng nhập mã xác thực của bạn</Text>
					<Text style={styles.bodySubTitle}>đã được gửi tới địa chỉ email: {this.state.user.email}</Text>
					<Text style={styles.errorCode}>{this.state.codeError}</Text>

					<TextInput
					    style={styles.textInputCode}
					    onChangeText={(text) => this.setState({code: text})}
					    value={this.state.code}
					    keyboardType={"numeric"}
					    blurOnSubmit={true}
					    autoFocus={true}
					    maxLength = {4}
					    placeholder="XXXX"
					    placeholderTextColor="#bdc3c7"
					  />

					<TouchableOpacity
						style={styles.activeButton}
						onPress={this.onActivePress}>
						<Text style={styles.buttonText}>KÍCH HOẠT</Text>
					</TouchableOpacity>

					<TouchableOpacity
						style={styles.resendButton}
						onPress={this.onResendPress}>
						<Text style={styles.resendText}>Gửi lại mã code</Text>
					</TouchableOpacity>
				</View>

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
	}
});


const styles = StyleSheet.create({
	container: {
		flex: 1
	},
	toolbar:{
		height: 56,
		backgroundColor: "#ffffff",
		alignItems: "center",
		justifyContent: "center"
	},
	titleToolbar:{
		fontSize: 17,
		color: "#000000"
	},
	body:{
		paddingTop: 10,
		flex: 1,
		backgroundColor: "#2c3e50",
		alignItems: "center",
	},
	bodyTitle:{
		color: "#ecf0f1",
		fontSize: 15,
		fontWeight: "bold"
	},
	bodySubTitle:{
		color: "#ecf0f1",
		fontSize: 15,
		textAlign: "center"
	},
	textInputCode:{
		width: 50,
	
	},
	activeButton:{
		height: 40,
		borderRadius: 3,
		alignItems: "center",
		width: 235,
		justifyContent: "center",
		backgroundColor: "#bdc3c7"
	},
	resendButton:{
		marginTop: 10,
		width: 235,
		alignItems: "flex-end"
	},
	resendText:{
		fontSize: 15,
		color: "#2980b9"
	},
	errorCode:{
		color: "#e74c3c"
	}
});

module.exports = ActiveLayout;