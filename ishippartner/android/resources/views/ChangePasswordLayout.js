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
	TextInput
} = React;

var Icon = require('react-native-vector-icons/Ionicons');
var ProgressBar = require('ProgressBarAndroid');
var MyToolBar = require('./MyToolBar.js');
var app = require('../../../lib/share/app');
var moment = require('moment');
var ImagePickerManager = require('NativeModules').ImagePickerManager;
moment.locale('vi');

var UserProfileLayout = React.createClass({
	getInitialState: function(){
		var email = this.props.email;
		return {
			email: email,
			oldPassword: '',
			newPassword: '',
			retypePassword: '',
		}
	},
	componentDidMount: function(){
		
	},
	componentWillUnmount: function(){
		
	},
	render: function(){
		return (
		<View style={{flex: 1}}>
			<View style={styles.headerContainer} >
				<View style={styles.toolbar}>
					<TouchableOpacity
						style = {styles.iconBack}
						onPress = {this.onPressBack}>
						<Icon name= "android-arrow-back" size={25} color="#ffffff" />
					</TouchableOpacity>
					<View style = {styles.title}>
						<Text style = {styles.titleText}>Thay đổi mật khẩu</Text>
					</View>
					<TouchableOpacity style={styles.saveButton}>
						<Text style = {styles.textButton}>Lưu</Text>
					</TouchableOpacity>
				</View>
			</View>

			<View style={styles.footerContainer}>
				<View style = {styles.containerInf}>
					<TextInput
						style = {styles.textInput}
						placeholder = {'Mật khẩu cũ'}
						value = {this.state.oldPassword}
						secureTextEntry = {true}
						onChangeText = {(text)=>this.setState({oldPassword: text})}
					  	/>
				</View>

				<View style = {styles.containerInf}>
					<TextInput
						style = {styles.textInput}
						placeholderColor = {'#7f8c8d'}
						placeholder = {'Mật khẩu mới'}
						value = {this.state.newPassword}
						secureTextEntry = {true}
						onChangeText = {(text)=>this.setState({newPassword: text})}
					  	/>
				</View>

				<View style = {styles.containerInf}>
					<TextInput
						placeholder = {'Nhập lại mật khẩu mới'}
						style = {styles.textInput}
						value = {this.state.retypePassword}
						secureTextEntry = {true}
						onChangeText = {(text)=>this.setState({retypePassword: text})}
					  	/>
				</View>
			</View>
		</View>
		);
	},
	onPressBack: function(){
		this.props.navigator.pop();
	},
});


const styles = StyleSheet.create({
	headerContainer:{
		backgroundColor: '#2c3e50'
	},
	toolbar:{
		height: 56,
		flexDirection: 'row',
	},
	iconBack:{
		width: 50,
		justifyContent: 'center',
		alignItems: 'center'
	},
	title:{
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	titleText:{
		fontSize: 17,
		color: "#ffffff"
	},
	saveButton:{
		width: 50,
		justifyContent: 'center',
		alignItems: 'center',
	},
	textButton:{
		color: '#ffffff',
		fontSize: 17,
	},
	footerContainer:{
		marginLeft: 20,
		marginRight: 20,
		marginBottom: 10,
		marginTop: 10,
	},
	containerInf:{
		height: 40,
		borderRadius: 3,
		marginTop: 10,
		backgroundColor: '#bdc3c7',
		justifyContent: 'center',
		alignItems: 'center'
	},
	textInput:{
		height: 56,
		textAlign: 'center'
	},
});

module.exports = UserProfileLayout;