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
	TextInput
} = React;

var Icon = require('react-native-vector-icons/Ionicons');
var ProgressBar = require('ProgressBarAndroid');
var MyToolBar = require('../MyToolBar.js');
var app = require('../../../../lib/share/app');
var validator = require('validator');
var checkEmailUtils = require('../../../../lib/utils/checkEmail.js');
var consts = require('../../../../lib/consts/consts');

var UserProfileLayout = React.createClass({
	getInitialState: function(){
		return {
			email: '',
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
						<Text style={styles.titleText}>Vui lòng nhập địa chỉ email tài khoản của bạn</Text>
					</View>

					<View style={styles.form}>
						<Text style={styles.error}>{this.state.error}</Text>
						<TextInput
							style={{height: 40, borderColor: 'gray'}}
							value={this.state.email}
							onChangeText={(text) => this.setState({email: text})}
							placeholder="Email"
							autoFocus = {true}
							placeholderTextColor="#7f8c8d"
							keyboardType="email-address" />

						<TouchableOpacity
							onPress={this.onEmailPress}
							style={styles.emailButton} >
							
							<Text style={styles.emailText}>TIẾP TỤC</Text>
						
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
		var email = this.state.email;
		var valid = true;
		if(!validator.isEmail(email)){
			valid = false;
			this.setState({error: 'Email không hợp lệ'});
		}else {
			if(this.state.error != ''){
				this.setState({
					error: ''
				})
			}
		}

		if(valid){
			_self._setModalVisible(true);
			checkEmailUtils
			.checkEmail(email)
			.then(function(result){
				_self._setModalVisible(false);
				if(result.code == consts.CODE.SUCCESS){
					var route = {name: 'TypeCodeLayout', email: email};
					_self.props.navigator.push(route);
				} else if (result.code == consts.CODE.FAILD){
					_self.setState({
						error: 'Không tồn tại tài khoản nào với địa chỉ email này'
					})
				} else if (result.code == consts.CODE.ERROR){
					_self.alertError('Thông báo', 'Đã có lỗi xảy ra vui lòng thử lại!', 'OK');
				}
			})
			.catch(function(err){
				_self._setModalVisible(false);
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
		color: "#e74c3c",
		textAlign: 'center'
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
	}
});

module.exports = UserProfileLayout;