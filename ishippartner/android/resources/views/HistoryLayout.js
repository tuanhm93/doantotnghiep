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
	Dimensions
} = React;

var Icon = require('react-native-vector-icons/Ionicons');
var ProgressBar = require('ProgressBarAndroid');
var MyToolBar = require('./MyToolBar.js');
var app = require('../../../lib/share/app');
var moment = require('moment');
moment.locale('vi');

var {height, width} = Dimensions.get('window');

var HistoryLayout = React.createClass({
	getInitialState: function(){
		this._histories = [];
		return {
			workMode: this.props.workMode,
			dataSource: new ListView.DataSource({
	        	rowHasChanged: (row1, row2) => row1 !== row2,
	      	}),
	      	loaded: false,
		}
	},
	componentDidMount: function(){
		var _self = this;
		var socket = app.get('socket');
		setTimeout(function(){
			socket.emit('get_history', {workMode: _self.state.workMode, start: 0});	
		}, 1000);
		socket.on('get_history', function(data){
			_self._histories = _self._histories.concat(data.histories);
			_self.setState({
          		dataSource: _self.state.dataSource.cloneWithRows(_self._histories),
          		loaded: true,
        	});
		});
	},
	componentWillUnmount: function(){
		var socket = app.get('socket');
		socket.removeAllListeners('get_history');
	},
	render: function(){
		if(this.state.loaded){
			return this.renderHistory();
		}else {
			return this.renderLoadingHistory();
		}
	},
	renderLoadingHistory(){
		var toolBar = this.renderToolbar();
		return 	(
			<View style={{flex: 1}}>
				{toolBar}
				<View style={{flex: 1, justifyContent: 'center'}}>
					<ProgressBar styleAttr="Normal" />
				</View>
			</View>
		)																																																																																																																																																																																																																																																																																										
	},
	renderHistory(){
		var toolBar = this.renderToolbar();
		return 	(
			<View style={{flex: 1}}>
				{toolBar}

				<ListView
					enableEmptySections = {true}
			        dataSource={this.state.dataSource}
			        renderRow={this.renderItemHistory}
			        style={styles.listView}
			    />

			</View>
		)
	},
	renderItemHistory: function(history){
		var urlMap = this.generateUrlMap(history.startPoint, history.endPoints);

		return (
			<TouchableOpacity
				style={styles.itemHistory}
				onPress={this.onPressItem} >
				<View style={styles.dateTime}>
					<Text style={{color: "#ffffff"}}>{moment(history.createdAt).format('llll')}</Text>
				</View>
				<View style={styles.map}>
					<Image style={styles.mapImage} source={{uri: urlMap}} />
				</View>
				<View style={styles.userProfile}>
					{history.user.avatar == '' ?
						<Image style={styles.avatar} source={require('../../../public/images/avatardefault.png')}/> :
						<Image style={styles.avatar} source={{uri: history.user.avatar}}/> }
					<View style={{paddingLeft: 10}} >
						<Text style={styles.username}>{history.user.username}</Text>
					</View>
				</View>
			</TouchableOpacity>
		);
	},
	renderToolbar(){
		return (
			<MyToolBar
				style={{backgroundColor: "#2c3e50", height: 56}}
				title={"LỊCH SỬ HOẠT ĐỘNG"}
				icon={"android-arrow-back"}
				onPress={this.onPressBack} >
			</MyToolBar>
		);
	},
	onPressBack: function(){
		this.props.navigator.pop();
	},
	generateUrlMap: function(startPoint, endPoints){
		var widthImage = width - 42;
		var heightImage = 200;
		var url = "https://maps.googleapis.com/maps/api/staticmap?zoom=10&maptype=roadmap&size="+widthImage+"x"+heightImage;
		url = url + "&markers=color:0x1D8668%7Clabel:S%7C"+startPoint.coordinates.latitude+","+startPoint.coordinates.longitude;

		for(var i=0;i < endPoints.length; i++){
			var endPoint = endPoints[i];
			url += "&markers=color:0xff0000%7Clabel:E%7C"+endPoint.coordinates.latitude+","+endPoint.coordinates.longitude;
		}
		url = url + "&key=AIzaSyDC6rWzBLRa_QS_-h40-LOdcFB0otc8tqM";
		return url;
	}
});


const styles = StyleSheet.create({
	listView: {
		marginLeft: 20,
		marginRight: 20,
		marginBottom: 10
	},
	itemHistory:{
		marginTop: 10,
		borderRadius: 2,
		borderWidth: 1,
		borderColor: '#34495e'
	},
	dateTime:{
		height: 40,
		justifyContent: 'center',
		backgroundColor: '#34495e',
		paddingLeft: 10,
	},
	userProfile:{
		height: 60,
		alignItems: 'center',
		backgroundColor: '#34495e',
		flexDirection: 'row',
		paddingLeft: 10
	},
	avatar:{
		height: 50,
		width: 50,
		borderRadius: 25
	},
	username:{
		color: '#ffffff',
		fontSize: 17,
		paddingLeft: 10
	},
	mapImage:{
		width: width - 42,
		height: 200
	}
});

module.exports = HistoryLayout;