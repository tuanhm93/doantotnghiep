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
var consts = require('../../../lib/consts/consts');
moment.locale('vi');

var UserProfileLayout = React.createClass({
	getInitialState: function(){
		var source = require('../../../public/images/avatardefault.png');
		if(this.props.user.avatar != ''){
			source = {uri: this.props.user.avatar, isStatic: true};
		}
		return {
			user: this.props.user,
			username: this.props.user.username,
			phoneNumber: this.props.user.phoneNumber,
			source: source
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
						<Text style = {styles.titleText}>Cập nhật thông tin</Text>
					</View>
					<TouchableOpacity style={styles.saveButton}>
						<Text style = {styles.textButton}>Lưu</Text>
					</TouchableOpacity>
				</View>
				<View style={styles.avatarContainer}>
					<TouchableOpacity 
						style={styles.avatarButton}
						onPress={this.onPressAvatar}>
							<Image style={styles.avatarButton} source={this.state.source} /> 
					</TouchableOpacity>
				</View>
			</View>

			<View style={styles.footerContainer}>
				<View style = {styles.containerInf}>
					<TextInput
						style = {styles.textInput}
						placeholder = {'Tên hiển thị'}
						autoCapitalize = {'words'}
						value = {this.state.username}
						onChangeText = {(text)=>this.setState({username: text})}
					  	/>
				</View>

				<View style = {styles.containerInf}>
					<TextInput
						style = {styles.textInput}
						placeholderColor = {'#7f8c8d'}
						placeholder = {'Số điện thoại'}
						keyboardType = {'numeric'}
						value = {this.state.phoneNumber}
						onChangeText = {(text)=>this.setState({phoneNumber: text})}
					  	/>
				</View>

				<View style = {styles.containerInf}>
					<TextInput
						style = {[styles.textInput, styles.email]}
						editable = {false}
						value = {this.state.user.email}
					  	/>
				</View>
				{this.state.user.accountType == consts.ACCOUNT_TYPE.NORMAL ? 
					<TouchableOpacity
						style={styles.changePasswordButton}
						onPress={this.onChangePasswordPress}>
						<Text style = {styles.changePasswordButtonText}>Thay đổi mật khẩu</Text>
					</TouchableOpacity> : null }
			</View>
			{/*<MyToolBar
				style={{backgroundColor: "#2c3e50", height: 56}}
				title={"THÔNG TIN CÁ NHÂN"}
				icon={"android-arrow-back"}
				onPress={this.onPressBack} >
			</MyToolBar>
			<View style={{flex: 1}}>
				<View style={styles.usernameAndAvatar}>
					{this.state.user.avatar == '' ?
						<Image style={styles.avatar} source={require('../../../public/images/avatardefault.png')}/> :
						<Image style={styles.avatar} source={{uri: this.state.user.avatar }}/> }
					<View style={{paddingTop: 10}} >
						<Text style={styles.username}>{this.state.user.username}</Text>
					</View>
				</View>
				<View style={styles.infContainer}>
					<Text style={styles.title}>Email:</Text>
					<Text style={styles.content}>{this.state.user.email}</Text>
					<Text style={styles.title}>Số điện thoại:</Text>
					{this.state.user.phoneNumber == '' ?
						<Text style={styles.content}>Chưa cập nhật</Text> :
						<Text style={styles.content}>{this.state.user.phoneNumber}</Text>}
					<TouchableOpacity
						style={styles.button}>
						<Text style={styles.buttonText}>CHỈNH SỬA</Text>
					</TouchableOpacity>
				</View>							
			</View>*/}
		</View>
		);
	},
	onPressBack: function(){
		this.props.navigator.pop();
	},
	onPressAvatar: function(){
		var _self = this;

		var options = {
		  	title: 'Ảnh đại diện', // specify null or empty string to remove the title
		  	cancelButtonTitle: 'Hủy bỏ',
		  	// takePhotoButtonTitle: 'Chụp ảnh...', // specify null or empty string to remove this button
		  	chooseFromLibraryButtonTitle: 'Chọn ảnh...', // specify null or empty string to remove this button
		  	// cameraType: 'front', // 'front' or 'back'
		  	mediaType: 'photo', // 'photo' or 'video'
		  	maxWidth: 256, // photos only
		  	maxHeight: 256, // photos only
		  	aspectX: 1, // android only - aspectX:aspectY, the cropping image's ratio of width to height
		  	aspectY: 1, // android only - aspectX:aspectY, the cropping image's ratio of width to height
		  	quality: 1, // 0 to 1, photos only
		  	allowsEditing: true, // Built in functionality to resize/reposition the image after selection
		  	noData: true, // photos only - disables the base64 `data` field from being generated (greatly improves performance on large photos)
		};

		ImagePickerManager.showImagePicker(options, (response) => {
		  	console.log('Response = ', response);

		  	if (response.didCancel) {
		    	console.log('User cancelled image picker');
		  	}
		  	else if (response.error) {
		    	console.log('ImagePickerManager Error: ', response.error);
		  	}
		  	else if (response.customButton) {
		    	console.log('User tapped custom button: ', response.customButton);
		  	}
		  	else {
			    const source = {uri: response.uri, isStatic: true};
			    _self.setState({
			    	source: source
			    });
		  	}
		});
	},
	onChangePasswordPress: function() {
		var route = {name: 'ChangePasswordLayout', email: this.state.user.email};
		this.props.navigator.push(route);
	}
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
	avatarContainer:{
		height: 150,
		justifyContent: 'center',
		alignItems: 'center'
	},
	avatarButton: {
		width: 50,
		height: 50,
		borderRadius: 25
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
	email: {
		color: '#3498db'
	},
	changePasswordButton: {
		alignItems: 'flex-end',
		marginTop: 5,
	},
	changePasswordButtonText: {
		color: '#2980b9',
		fontSize: 15
	}
});

module.exports = UserProfileLayout;