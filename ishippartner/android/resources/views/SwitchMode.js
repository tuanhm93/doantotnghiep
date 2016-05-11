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
			user: this.props.user
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

			</Image>
		);
	},
	onShipperPress: function(){
		var route = {name: 'ShipperChooseOption', user: this.state.user};
		this.props.navigator.resetTo(route);
	},
	onCallerPress: function(){
		var route = {name: 'CallerMainLayout', user: this.state.user};
		this.props.navigator.resetTo(route);
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
	}
});

module.exports = SwitchMode;