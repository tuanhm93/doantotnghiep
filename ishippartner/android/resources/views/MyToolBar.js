"use strict";

var React = require('react-native');

var {
	View,
	Text,
	StyleSheet,
	TouchableOpacity
} = React;

var Icon = require('react-native-vector-icons/Ionicons');
var ProgressBar = require('ProgressBarAndroid');

var MyToolBar = React.createClass({
	getInitialState: function(){
		return {
			icon: this.props.icon,
			title: this.props.title,
		}
	},

	componentWillReceiveProps: function(newProps){
		if(newProps.icon != this.props.icon){
			this.setState({
				icon: newProps.icon
			});
		}

		if(newProps.title != this.props.title){
			this.setState({
				title: newProps.title
			});
		}
	},
	handleIconClick: function(){
		this.props.onPress(1);
	},
	render: function(){
		var icon = null;
		if(this.state.icon != null){
			icon = (
				<TouchableOpacity
					style={{flex: 1, alignItems: "center", justifyContent: "center"}}
					onPress={this.handleIconClick} >
					<Icon name={this.state.icon} size={30} color="#ffffff" />
				</TouchableOpacity>
			);
		}
		return (
			<View style={this.props.style}>
				<View style={styles.contentToolbar}>
					<View style={styles.icon}>
						{icon}
					</View>

					<View style={styles.title}>
						<Text style={styles.titleTextStyle}>{this.state.title}</Text>
					</View>

					<View style={styles.action}>

					</View>
				</View>
			</View>
		);
	}
});


const styles = StyleSheet.create({
	contentToolbar:{
		flex: 1,
		flexDirection: 'row',
		borderBottomWidth: 1,
		borderBottomColor: '#ffffff'
	},
	icon:{
		width: 50,
	},
	title:{
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
	},
	titleTextStyle:{
		fontSize: 20,
		color: '#ffffff',
	},
	action:{
		width:50,
		alignItems: "center",
		justifyContent: "center"
	}
});

module.exports = MyToolBar;