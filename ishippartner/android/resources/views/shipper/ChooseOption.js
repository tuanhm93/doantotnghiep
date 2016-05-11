"use strict";

var React = require('react-native');

var {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	ToastAndroid,
	TextInput,
	Modal
} = React;

var Icon = require('react-native-vector-icons/Ionicons');
var ProgressBar = require('ProgressBarAndroid');
var DrawerLayout = require('../DrawerLayout');
var MyToolBar = require('../MyToolBar.js');
var CheckBox = require('react-native-checkbox');
var validator = require('validator');

var ChooseOptionLayout = React.createClass({
	getInitialState: function(){
		return {
			user: this.props.user,
			titleToolbar: 'ISHIP',
			iconToolbar: 'navicon',
			handleClickIconToolbar: this.openDrawer,
			checkRadius: false,
			checkNhoNhe: false,
			checkTrungBinh: false,
			checkNgoaiCo: false,
			radius: '',
			modalVisible: false,
			errorRadius: '',
			errorTypeShip: ''
		}
	},

	render: function(){
		return (
			<DrawerLayout
				user = {this.state.user}
				ref = "drawer"
				navigator = {this.props.navigator}
				style={styles.drawer} >
				<MyToolBar
					style={{backgroundColor: "#1D8668", height: 56}}
					title={this.state.titleToolbar}
					icon={this.state.iconToolbar}
					onPress={this.state.handleClickIconToolbar} >
				</MyToolBar>

				<View style={styles.container}>
					<View style={styles.content}>
						<TouchableOpacity
							style={styles.button}
							onPress={this.onGoOnlinePress}>
							<Text style={{fontSize: 17, color: "#ffffff"}}>BẮT ĐẦU</Text>
						</TouchableOpacity>

						<View style={styles.typeRadius}>
							<Text style={{color: "#000000"}}>Bán kính:</Text>
							<TextInput 
								style={{height: 40, width: 50}}
								onChangeText={(text) => this.setState({radius: text})}
								keyboardType="numeric"
								maxLength = {4} />
							<Text style={{color: "#000000"}}>(km)</Text>	
						</View>
						<View style={{paddingLeft: 20}}>
							<CheckBox
								label="Mọi khoảng cách"
	      						checked={this.state.checkRadius}
	      						onChange={(checked)=>{this.setState({checkRadius: checked})}}
	      						labelStyle={{color: "#000000", fontSize: 13}}/>
						</View>

						<Text style={{color: "#000000"}}>Loại hàng hóa:</Text>
						<View style={{paddingLeft: 20}}>
							<CheckBox
								label="Nhỏ nhẹ"
	      						checked={this.state.checkNhoNhe}
	      						onChange={(checked)=>{this.setState({checkNhoNhe: checked})}}
	      						labelStyle={{color: "#000000", fontSize: 13}}/>
	      					<CheckBox
								label="Trung bình"
	      						checked={this.state.checkTrungBinh}
	      						onChange={(checked)=>{this.setState({checkTrungBinh: checked})}}
	      						labelStyle={{color: "#000000", fontSize: 13}}/>
	      					<CheckBox
								label="Ngoại cỡ"
	      						checked={this.state.checkNgoaiCo}
	      						onChange={(checked)=>{this.setState({checkNgoaiCo: checked})}}
	      						labelStyle={{color: "#000000", fontSize: 13}}/>	
						</View>

						<Text style={{color: '#e74c3c'}}>{this.state.errorRadius}</Text>
						<Text style={{color: '#e74c3c'}}>{this.state.errorTypeShip}</Text>
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

			</DrawerLayout>
		);
	},
	openDrawer: function(){
		this.refs.drawer.openDrawer();
	},
	onGoOnlinePress: function(){
		var radius = 0;
		var valid = true;
		
		var typeShipValue = 0;
		if(this.state.checkRadius){
			radius = -1;
			if(this.state.errorRadius != ''){
				this.setState({errorRadius:''});
			}
		}else{
			if(validator.isFloat(this.state.radius)){
				radius = Number(this.state.radius);
				if(this.state.errorRadius != ''){
					this.setState({errorRadius:''});
				}
			}else{
				this.setState({errorRadius: 'Bán kính không hợp lệ'});
				valid = false;
			}
		}

		if(this.state.checkNhoNhe){
			typeShipValue |= 4;
		}

		if(this.state.checkTrungBinh){
			typeShipValue |= 2;
		}

		if(this.state.checkNgoaiCo){
			typeShipValue |= 1;
		}

		if(typeShipValue == 0){
			valid = false;
			this.setState({errorTypeShip: 'Vui lòng chọn loại hàng hóa ship'});
		}else{
			if(this.state.errorTypeShip != ''){
				this.setState({errorTypeShip: ''});
			}
		}

		if(valid){
			var route = {name: 'ShipperMainLayout', user: this.state.user};
			this.props.navigator.push(route);
		}
	},
	_setModalVisible: function(value){
		this.setState({
			modalVisible: value
		});
	}
});


const styles = StyleSheet.create({
	drawer:{
		flex: 1,
	},
	container:{
		flex: 1,
		backgroundColor: "#ecf0f1"
	},
	content:{
		marginTop: 20,
		marginLeft: 30,
		marginRight: 30,
		borderRadius: 1,
		padding: 10,
		backgroundColor: "#ffffff"
	},
	button:{
		height: 50,
		backgroundColor: "#3498db",
		alignItems: "center",
		borderRadius: 2,
		justifyContent: "center"
	},
	typeRadius:{
		flexDirection: 'row',
		alignItems: 'center'
	},
	modalContainer:{
		flex: 1,
		alignItems: "center",
		justifyContent: "center"
	},
	modalContent:{
		alignSelf: "stretch",
		marginLeft: 50,
		marginRight: 50,
		alignItems: "center",
		justifyContent: "center",
	}
});

module.exports = ChooseOptionLayout;