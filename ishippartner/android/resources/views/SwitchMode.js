"use strict";

var React = require('react-native');

var {
	View,
	Text,
	StyleSheet,
	TouchableOpacity,
	TextInput,
	Modal,
	Alert,
	Image
} = React;
var ProgressBar = require('ProgressBarAndroid');
var validator = require('validator');
var activeUtils = require('../../../lib/utils/active.js');
var consts = require('../../../lib/consts/consts.js');

var SwitchMode = React.createClass({
	getInitialState: function(){
		return {
			user: this.props.user,
			modalVisible: false
		};
	},
	render: function(){
		return (
			 <Image source={require('../../../public/images/IShip.jpg')} style={styles.backgroundImage}>
				<View style={{flex: 1}} />

		        <View style={styles.containerButton}>
		          <TouchableOpacity
		            onPress={this.onShipperPress}
		            style={[styles.button, styles.shipperButton]}>

		            <Text style={{fontSize: 15, color: "#1D8668"}}>I'M A SHIPPER</Text>

		          </TouchableOpacity>

		          <TouchableOpacity
		            onPress={this.onCallerPress} 
		            style={[styles.button, styles.callerButton]} >

		              <Text style={{fontSize: 15, color: "#ffffff"}}>I'M NOT A SHIPPER</Text>

		          </TouchableOpacity>
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

			</Image>
		);
	},
	_setModalVisible: function(value){
		this.setState({
			modalVisible: value
		});
	},
	onShipperPress: function(){
		var route = {name: 'ShipperChooseOption', user: this.state.user};
		this.props.navigator.resetTo(route);
	},
	onCallerPress: function(){
		var _self = this;
		this._setModalVisible(true);
		navigator.geolocation.getCurrentPosition(
	      	(position) => {
	      		_self._setModalVisible(false);
		        var currentLocation = {
		        	latitude: position.coords.latitude,
		        	longitude: position.coords.longitude
		        }
		        var route = {name: 'CallerMainLayout', user: this.state.user, currentLocation: currentLocation};
				_self.props.navigator.resetTo(route);
		    },
		    (error) => {
		    	_self._setModalVisible(false);
		    	var currentLocation = null;
		      	var route = {name: 'CallerMainLayout', user: this.state.user, currentLocation: currentLocation};
				_self.props.navigator.resetTo(route);
		    },
	      	{enableHighAccuracy: true, timeout: 15000, maximumAge: 5*60*1000}
	    );
	}
});


const styles = StyleSheet.create({
	backgroundImage: {
	    flex: 1,
	    width: null,
	    height: null,
	},
	containerButton:{
		height: 100,
	},
	button:{
		height: 40,
		marginLeft: 60,
		marginRight: 60,
		borderRadius: 2,
	},
	shipperButton:{
		borderWidth: 1,
	    borderColor: "#1D8668",
	    alignItems: "center",
	    justifyContent: "center",
	},
	callerButton:{
		marginTop: 10,
		marginBottom: 10,
		alignItems: "center",
	    justifyContent: "center",
	    backgroundColor: "#1D8668",
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

module.exports = SwitchMode;