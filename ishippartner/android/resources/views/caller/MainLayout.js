'use strict';

var React = require('react-native');
var {
	StyleSheet,
	View,
	Text,
	ToolbarAndroid,
	ToastAndroid,
	TouchableOpacity,
	Dimensions,
	TouchableOpacity,
	Picker,
	Alert,
	Image,
	Vibration,
	Modal,
	TextInput,
	ScrollView,
	ListView,
	Navigator,
	Dimensions,
	Animated,
	Slider
} = React;

var {height, width} = Dimensions.get('window');
var SPRING_CONFIG = {tension: -5, friction: 4}; //Soft spring

var ProgressBar = require('ProgressBarAndroid');
var MapView = require('react-native-maps');
var DrawerLayout = require('../DrawerLayout');
var app = require('../../../../lib/share/app');
var Icon = require('react-native-vector-icons/Ionicons');
var consts = require('../../../../lib/consts/consts');
var Sound = require('react-native-sound');
var ChatLayout = require('./Chat.js');
var MyToolBar = require('../MyToolBar.js');
var Communications = require('react-native-communications');
var locationNameUtil = require('../../../../lib/utils/locationname.js');

var MainLayout = React.createClass({

	getDefaultProps: function(){
		return {
	      	value: 0,
	    }
	},

	getInitialState: function(){
		console.log("initial state: MainLayout");
		this.current = {
			latitude: 21.0227,
			longitude: 105.8019,
		};
		if(this.props.currentLocation != null){
			this.current = this.props.currentLocation;
		}

		this.currentDelta = {
			latitudeDelta: 0.01549886894352781,
			longitudeDelta: 0.010693632066249847
		};
		this.locationDeltaConfirm = {
			latitudeDelta: 0.0026736060809362527,
			longitudeDelta: 0.001844353973865509
		};
		this.shipid =  '';
		this.dingSound =  null;
		this.isLoaded = false;
		this.hasLoadChat = false;
		this.isNewMessageLoaded = false;
		this.messageBuffer = [];
		this._messages = [];
		this.shipType = 4;

		var state = {};
		state.user = this.props.user;
		state.initialRegion = {
			latitude: this.current.latitude,
			longitude: this.current.longitude,
			latitudeDelta: this.currentDelta.latitudeDelta,
			longitudeDelta: this.currentDelta.longitudeDelta,
		};
		state.startPoint = null;
		state.endPoints = [
		{
			id: 1,
			latitude: 20.93,
			longitude: 105.959
		},
		{
			id: 2,
			latitude: 20.9193186,
			longitude: 105.93512
		},
		{
			id: 3,
			latitude: 20.964580,
			longitude: 105.933397
		}];

		state.workMode = this.props.workMode;
		state.locationName = 'Di chuyển tới vị trí cần đón';

		state.content = 'KHÔNG CÓ SHIPPER QUANH ĐÂY';
		state.minutes = 0;
		state.hasNear = false;
		state.shippers = [];

		state.mode = 1;
		state.buttonModeText = '';
		state.titleModeText = '';
		state.danhGia = true;
		state.shipperProfile = null;
		state.colors = [];
		state.openChat = false;
		state.messages = [];

		state.titleToolbar = 'ISHIP';
		state.iconToolbar = 'navicon';
		state.handleClickIconToolbar = this.openDrawer;
		state.mainAnimated = new Animated.ValueXY();
		state.chatAnimated = new Animated.ValueXY();
		state.value = this.props.value;

		return state;	
	},

	openDrawer: function(){
		this.refs.drawer.openDrawer();
	},

	render: function() {
		console.log("render: MainLayout");

		return (
			<Animated.View style={{flex: 1, flexDirection: "row", width: 2*width, transform: this.state.mainAnimated.getTranslateTransform()}}>
			<DrawerLayout
				user = {this.state.user}
				ref = "drawer"
				workMode = {this.state.workMode}
				navigator = {this.props.navigator}
				style={styles.drawer} >
			    {this.state.mode == 1 || this.state.mode == 2 || this.state.mode == 3 || this.state.mode == 4?
					<MyToolBar
						style={{backgroundColor: "#1D8668", height: 56}}
						title={this.state.titleToolbar}
						icon={this.state.iconToolbar}
						onPress={this.state.handleClickIconToolbar} >
					</MyToolBar> : null}
				
				{this.state.mode == 5 || this.state.mode == 8 || this.state.mode == 6 || this.state.mode == 7?
					<ToolbarAndroid
						title={this.state.titleModeText}
						style={styles.toolbarModeShipped}
						actions={[
							{title: 'Chat'},
							{title: 'Hủy ship'}
						]}
						onActionSelected={this.toolbarAction}
						titleColor="#ffffff" /> : null }

				<MapView 
					ref = "map"
					style={ styles.map }
					initialRegion={this.state.initialRegion}
					onRegionChangeComplete={this.changeLocation}
					onRegionChange={this.change}
					showsUserLocation={true}
					onLongPress = {this.onLongPress} >

					{this.state.shippers.map(shipper => (
						<MapView.Marker 
							coordinate={shipper.location}
							key = {shipper.userid}
							image={require('../../../../public/images/motor.png')} >
						</MapView.Marker> ))}
					{this.state.startPoint ?
						<MapView.Marker
							coordinate={this.state.startPoint} >
							<Icon name="ios-location" size={45} color="#1D8668" />
						</MapView.Marker> : null}
					{this.state.endPoints.map(endPoint => (
						<MapView.Marker
							key = {endPoint.id}
							coordinate={endPoint} >
							<Icon name="ios-location" size={45} color="#ff0000" />
						</MapView.Marker> ))}
				</MapView>

				{this.state.mode == 1 ?
					<View style={styles.typeShipContainer}>
						<View style={{flexDirection: 'row', alignSelf: "stretch"}}>
							<Text style={{color: '#000000'}}>Nhỏ nhẹ</Text>
							<View style={{flex: 1, alignItems: 'center'}}>
								<Text style={{color: '#000000'}}>Trung bình</Text>
							</View>
							<Text style={{color: '#000000'}}>Ngoại cỡ</Text>
						</View>
						<Slider
				          	{...this.props}
				          	onValueChange={this.changeShipType}
				          	style={{alignSelf: 'stretch', paddingLeft: 10, paddingRight: 10}}
				          	minimumValue= {0}
				          	maximumValue = {2}
				          	step = {1}
				          	 />
					</View> : null}

				{this.state.hasNotify ?
					<View style={{position: "absolute", top: 2, right: 5, height: 15, width: 18}}>
						<Icon name = "chatbox-working" size={20} color="#ff0000" />
					</View> : null}

				<View style={styles.containerInMap}>
					{this.state.mode == 3 || this.state.mode == 4 ? 
						<View style={styles.progressBar}>
							<ProgressBar color="#000000" styleAttr="Horizontal" />
						</View> : null}
					
					<View style={styles.currentLocationContainer}>
						<TouchableOpacity style={styles.searchCurrentLocationContainer}>
							<View style={styles.iconSearch}>
								<Icon name="ios-search" size={20} color="#ffffff" />
							</View>
							<View style={styles.currentLocation}>
								<Text style={styles.currentLocationTitle}>ĐỊA ĐIỂM ĐÓN</Text>
								<Text style={styles.currentLocationName}>{this.state.locationName}</Text>
							</View>

						</TouchableOpacity>
						<View style={styles.addDestination}>
							{this.state.mode == 2 ?
								<TouchableOpacity style={{flex: 1, alignItems: "center", justifyContent: "center"}}>
									<Icon name="ios-plus-outline" size={20} color="#ffffff" />
								</TouchableOpacity> : null}
						</View>
					</View> 
					

					{this.state.mode == 1 || this.state.mode == 2 ? 
						<View style={styles.iconGPS}>
							<Icon style={{marginTop: -45, marginRight: 1}} name="ios-location" size={45} color="#1D8668" />
						</View> : null }

					{this.state.mode == 1?
						<View style={styles.infShipperNearestContainer}>
							<View style={styles.infShipperNearest}>
								{this.state.hasNear ? 
									<View style={styles.minutes}>
										<Text style={{fontSize: 10, color: '#ffffff'}}>{this.state.minutes}</Text>
										<Text style={{fontSize: 10, color: '#ffffff'}}>phút</Text>
									</View> : null}

									<View style={styles.content}>
										<Text style={{color: '#ffffff'}}>{this.state.content}</Text>
									</View>

									{this.state.hasNear ? 
										<TouchableOpacity
											style={styles.buttonNearest}
											onPress={()=>this.switchMode(2)}>
											<Icon name="ios-arrow-right" size={20} color="#ffffff" />
										</TouchableOpacity> : null}
							</View>
						</View> : null}

					{this.state.mode == 2 || this.state.mode == 3?
						<TouchableOpacity
							style={styles.modeButton} 
							onPress={this.buttonMode} >
							<Text style={styles.buttonModeText}>{this.state.buttonModeText}</Text>
						</TouchableOpacity> : null}
				</View>

				

				
				{this.state.mode == 5 || this.state.mode == 6 || this.state.mode == 7?
					<View style={styles.shipperProfileContainer}>
						<View style={styles.profileContainer}>
							{this.state.shipperProfile.avatar == '' ?
								<Image style={styles.shipperAvatar} source={require('../../../../public/images/avatardefault.png')}/> :
								<Image style={styles.shipperAvatar} source={{uri: this.state.shipperProfile.avatar}}/> }
							<View style={styles.shipperProfile}>
								<Text style={[styles.text, styles.shipperUsername]}>{this.state.shipperProfile.username}</Text>
								<View style={styles.shipperStarContainer}>
									<Text style={[styles.text, styles.shipperStar]}>3.8  </Text>
									<Icon name = "android-star" size={20} color="#ffffff"/>
								</View>
							</View>
						</View>
						<TouchableOpacity
							onPress = {()=>{
						    	if(this.state.shipperProfile.phoneNumber != ''){
						    		Communications.phonecall(this.state.shipperProfile.phoneNumber,  true);
						    	}else{
						    		Alert.alert(
										'Thông báo',
										'Người dùng này chưa cập nhật số điện thoại',
										[
											{text: 'OK'},
										]
									);
						    	}
						    }}
							style={styles.callShipperButton} >
							<Icon name = "android-call" size={20} color="#ffffff"/>
						</TouchableOpacity>
					</View> : null}

				{this.state.mode == 8 ?
					<Modal
						animated={true}
						transparent={false}
						visible={this.state.mode == 8}>
						<View style={styles.danhGiaXepHang}>
							<View style={styles.headerDanhGia}>
								<View style={styles.profileContainer}>
									{this.state.shipperProfile.avatar == '' ?
										<Image style={styles.shipperAvatar} source={require('../../../../public/images/avatardefault.png')}/> :
										<Image style={styles.shipperAvatar} source={{uri: this.state.shipperProfile.avatar}}/> }
									<View style={styles.shipperProfile}>
										<Text style={[styles.text, styles.shipperUsername]}>{this.state.shipperProfile.username}</Text>
										<View style={styles.shipperStarContainer}>
											<Text style={[styles.text, styles.shipperStar]}>3.8  </Text>
											<Icon name = "android-star" size={20} color="#ffffff"/>
										</View>
									</View>
								</View>
							</View>
							<View style={styles.bodyDanhGia}>
								{this.state.colors.map((color, index)=>(
									<TouchableOpacity
										key={index}
										onPress={()=>this.howMuchStar(index+1)}
										style={styles.starDanhGia}>
										<Icon name="android-star" size={20} color={color} />
									</TouchableOpacity>
								))}
								
								
								
							</View>
							<View style={styles.footerDanhGia}>
								<TouchableOpacity
									style={styles.danhGiaButton}
									onPress={this.danhGia} >
									<Text style={[styles.text, styles.danhGiaText]}>ĐÁNH GIÁ XẾP HẠNG</Text>
								</TouchableOpacity>
							</View>
						</View>
					</Modal> : null }
					
			</DrawerLayout>

			<View style={{flex: 1}}>
				<ChatLayout ref = "chat" _messages={this.state.messages} onBackPress={this.closeChat} shipid={this.shipid} />
			</View>
			</Animated.View>

			
		);
	},

	componentDidMount: function(){
		console.log("ComponentDidMount: MainLayout");
		var _self = this;
		var socket = app.get('socket');

		if(this.props.currentLocation == null){
			ToastAndroid.show('Chưa xác định được thông tin vị trí hiện tại', ToastAndroid.LONG);
		}
		locationNameUtil.getLocationName(this.current)
		.then(function(result){
			if(result.status == 'OK'){
				_self.setState({
					locationName: result.results[0].formatted_address
				});
			}
		});
		socket.on('get_shippers', function(data){
			if(data.shippers.length != 0){
				_self.setState({
					hasNear: true,
					shippers: data.shippers,
					minutes: data.minutes,
					content: 'YÊU CẦU SHIPPER'
				});
			}else if(_self.state.hasNear){
				_self.setState({
					hasNear: false,
					shippers: [],
					content: 'KHÔNG CÓ SHIPPER QUANH ĐÂY'
				});
			}
		});
		socket.on('has_arrived', function(){
			_self.switchMode(6);
			Vibration.vibrate([0, 500], false);
			if(_self.isLoaded)
				_self.dingSound.play();
		});

		socket.on('start_ship', function(){
			_self.switchMode(7);
			Vibration.vibrate([0, 500], false);
			if(_self.isLoaded)
				_self.dingSound.play();
		});

		socket.on('finish_ship', function(){
			_self.switchMode(8);
			Vibration.vibrate([0, 500], false);
			if(_self.isLoaded)
				_self.dingSound.play();
		});

		socket.on('no_shipper_available', function(){
			_self.switchMode(2);
			Alert.alert(
	            'Thông báo',
	            'Hệ thống không tìm thấy shipper nào quanh khu vực của bạn, vui lòng thử lại!',
	            [
	              {text: 'OK'},
	            ]
	        );
	        Vibration.vibrate([0, 500], false);
			if(_self.isLoaded)
				_self.dingSound.play();
		});

		socket.on('establish', function(data){
			_self.setState({
				shippers: [
					{
						userid: data.user._id,
						location: data.location
					}
				],
				shipperProfile: data.user
			});
			Vibration.vibrate([0, 500], false);
			if(_self.isLoaded)
				_self.dingSound.play();

			_self.shipid = data.shipid;
			_self.switchMode(5);
		});

		socket.on('cancel_ship', function(){
			_self.switchMode(8);
		});

		socket.on('get_message', function(message){
			if(!_self.state.openChat){
				_self.setState({
					hasNotify: true,
				});
			}
		});

		socket.on('location_name', function(data){
			_self.setState({
				locationName: data.roadName
			});
		});

		this.dingSound = new Sound('ding.wav', Sound.MAIN_BUNDLE, function(err){
			if(!err){
				_self.isLoaded = true;
			}
		});
	},

	openChat: function(){
		this.setState({
			openChat: true
		});
		Animated.spring(this.state.mainAnimated, {
		          ...SPRING_CONFIG,
		          toValue: {x: -width, y: 0}                       
	    }).start();

	},
	closeChat: function(){
		this.setState({
			openChat: false
		});
		this.refs.chat._GiftedMessenger.refs.textInput.blur();
		Animated.spring(this.state.mainAnimated, {
		          ...SPRING_CONFIG,
		          toValue: {x: 0, y: 0}                       
	    }).start();
	},

	toolbarAction: function(index){
		var socket = app.get('socket');
		var navigator = this.props.navigator;
		if(index == 0){
			this.openChat();
			if(this.state.hasNotify){
				this.setState({
					hasNotify: false
				});
			}
			
		}else if(index == 1){
			socket.emit('cancel_ship', {shipid: this.shipid});
			this.switchMode(8);
		}
	},
	changeLocation: function(region){
		console.log("Change location: ", JSON.stringify(region));
		var socket = app.get('socket');
	
		if(this.state.mode == 1){
			this.current.latitude = region.latitude;
			this.current.longitude = region.longitude;
			this.currentDelta.latitudeDelta = region.latitudeDelta;
			this.currentDelta.longitudeDelta = region.longitudeDelta;
			socket.emit('get_shippers', {location: this.current, shipType: this.shipType});	
			socket.emit('location_name', this.current);
		}else if(this.state.mode == 2){
			this.current.latitude = region.latitude;
			this.current.longitude = region.longitude;
			socket.emit('get_shippers', {location: this.current, shipType: this.shipType});	
			socket.emit('location_name', this.current);
		}

		// Get location name here
	},
	switchMode: function(mode){
		var previousMode = this.state.mode;
		if (mode == 1){
			this.setState({
				mode: 1,
				titleToolbar: 'ISHIP',
				iconToolbar: 'navicon',
				handleClickIconToolbar: this.openDrawer
			});
			var newRegion = {
				longitude: this.current.longitude,
				latitude: this.current.latitude,
				latitudeDelta: this.currentDelta.latitudeDelta,
				longitudeDelta: this.currentDelta.longitudeDelta
			}
			this.refs.drawer.setLockMode('unlocked');
			this.refs.map.animateToRegion(newRegion);
		} else if (mode == 2){
			if(previousMode == 1){
				this.setState({
					mode: 2,
					buttonModeText: 'YÊU CẦU SHIPPER',
					titleToolbar: 'XÁC NHẬN',
					iconToolbar: 'android-arrow-back',
					handleClickIconToolbar: this.switchMode
				});
				
				this.refs.drawer.setLockMode('locked-closed');
			}else if(previousMode == 4  || previousMode == 3 || previousMode == 5 || previousMode == 8){
				this.setState({
					mode: 2,
					buttonModeText: 'YÊU CẦU SHIPPER',
					titleToolbar: 'XÁC NHẬN',
					iconToolbar: 'android-arrow-back',
					handleClickIconToolbar: this.switchMode,
					startPoint: null
				});
			}
			
			var newRegion = {
				longitude: this.current.longitude,
				latitude: this.current.latitude,
				latitudeDelta: this.locationDeltaConfirm.latitudeDelta,
				longitudeDelta: this.locationDeltaConfirm.longitudeDelta
			}
			this.refs.map.animateToRegion(newRegion);
		}else if (mode == 3){
			if(previousMode == 2){
				this.setState({
					mode: 3,
					buttonModeText: 'HỦY YÊU CẦU',
					titleToolbar: 'ĐANG YÊU CẦU',
					iconToolbar: null,
					startPoint: {
						latitude: this.current.latitude, 
						longitude: this.current.longitude
					}
				});
			}else if(previousMode == 4){
				this.setState({
					mode: 3,
					titleToolbar: 'ĐANG YÊU CẦU',
				})
			}
		}else if(mode == 4){
			this.setState({
				mode: 4,
				titleToolbar: 'ĐANG HỦY YÊU CẦU'
			});
		}else if(mode == 5){
			this.setState({
				mode: 5,
				titleModeText: 'SHIPPER ĐANG TỚI'
			});
		}else if(mode == 6){
			this.setState({
				mode: 6,
				titleModeText: 'SHIPPER ĐÃ ĐẾN'
			});
		}else if(mode == 7){
			this.setState({
				mode: 7,
				titleModeText: 'SHIPPER ĐANG SHIP'
			});
		}else if(mode == 8){
			this._messages = [];
			this.closeChat();
			if(previousMode == 7){
				this.setState({
					mode: 8,
					titleModeText: 'SHIPPER ĐÃ SHIP XONG',
					colors: ["#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff"],
					messages: this._messages,
					openChat: false,
					hasNotify: false,
				});
			}else {
				this.setState({
					mode: 8,
					colors: ["#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff"],
					messages: this._messages,
					openChat: false,
					hasNotify: false
				});
			}
		}
	},
	buttonMode: function (){
		var socket = app.get('socket');
		var _self = this;
		if(this.state.mode == 2){
			this.switchMode(3);
			socket.emit('connect_shipper', {startPoint: this.state.startPoint, endPoints: this.state.endPoints, shipType: 4});
		}else if(this.state.mode == 3){
			this.switchMode(4);
			socket.emit('client_reject', function(data){
				if(data.code == consts.CODE.SUCCESS){
					_self.switchMode(2);
				}else {
					_self.switchMode(3);
				}
			});
		}
	},
	danhGia: function(){
		var socket = app.get('socket');
		var howMuchStar = 0;
		var colors = this.state.colors;
		for(var i=0;i<colors.length; i++){
			if(colors[i] == "#FFDF00"){
				howMuchStar++;
			}else{
				break;
			}
		}

		socket.emit('rate', {userid: this.state.shipperProfile._id, shipid: this.shipid, star: howMuchStar, type: consts.USER_TYPE.SHIPPER});
		this.switchMode(2);
	},
	howMuchStar: function(number){
		var colors=["#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff"];
		for(var i=0;i < number ;i++){
			colors[i] = "#FFDF00";
		}

		this.setState({
			colors: colors
		})
	},
	componentWillUnmount: function(){
		var _self = this;
		var socket = app.get('socket');

		socket.removeAllListeners('get_shippers');
		socket.removeAllListeners('has_arrived');
		socket.removeAllListeners('start_ship');
		socket.removeAllListeners('finish_ship');
		socket.removeAllListeners('no_shipper_available');
		socket.removeAllListeners('establish');
		socket.removeAllListeners('cancel_ship');
		socket.removeAllListeners('get_message');
		socket.removeAllListeners('location_name');
		socket.close();
	},
	changeShipType: function(value){
		this.setState({
			value: value,
			hasNear: false,
			shippers: [],
			content: 'KHÔNG CÓ SHIPPER QUANH ĐÂY'
		});
		if(value == 0){
			this.shipType = 4;
		}else if(value == 1){
			this.shipType = 2;
		}else if(value == 2){
			this.shipType = 1
		}
		var socket = app.get('socket');
		socket.emit('get_shippers', {location: this.current, shipType: this.shipType});
	}

});

const styles = StyleSheet.create({
	text:{
		color: "#ffffff"
	},
	drawer: {
		flex: 1
	},
	map: {
		flex: 1
	},
	containerInMap:{
		position: 'absolute',
		top: 56,
		left: 0,
		right: 0,
		bottom: 0,
	},
	currentLocationContainer: {
		flexDirection: "row",
		marginLeft: 10,
		marginRight: 10,
		borderWidth: 1,
		borderColor: "#ffffff",
		borderRadius: 2,
		backgroundColor: "#1D8668",
		marginTop: 10,
		height: 50
	},
	searchCurrentLocationContainer:{
		flex: 5,
		flexDirection: "row",
		justifyContent: "center",
		alignItems: "center"
	},
	addDestination:{
		flex: 1,
	},
	iconSearch:{
		flex: 2,
		alignItems: "center"
	},
	currentLocation:{
		flex: 8,
		alignItems: "center"
	},
	currentLocationTitle: {
		fontSize: 8,
		color: '#ecf0f1',
	},
	currentLocationName:{
		color: '#ffffff',
		fontSize: 15,
		textAlign: 'center'
	},
	infShipperNearestContainer:{
		position: "absolute",
		top: 0,
		left: 0,
		bottom: 0,
		right: 0,
		alignItems: "center",
		justifyContent: "center"
	},
	infShipperNearest:{
		marginTop: -85,
		height: 40,
		flexDirection: "row",
		borderRadius: 20,
		backgroundColor: "#1D8668",
		alignItems: "center",
		justifyContent: "center"
	},
	minutes:{
		marginLeft: 5,
		height: 34,
		width: 34,
		alignItems: "center",
		justifyContent: "center",
		borderRadius: 17,
		borderWidth: 1,
		borderColor: "#ffffff"
	},
	content:{
		paddingLeft: 10,
		paddingRight: 10,
		alignItems: "center",
		justifyContent: "center"
	},
	buttonNearest:{
		marginRight: 5,
		width: 34,
		height: 34,
		alignItems: "center",
		justifyContent: "center",
		borderRadius: 17,
		borderWidth: 1,
		borderColor: "#ffffff"
	},
	iconGPS:{
		position: "absolute",
		alignItems: "center",
		justifyContent: "center",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0
	},
	toolbarLookForContainer: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		height: 56
	},
	toolbarLookFor:{
		height: 56,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#1D8668"
	},
	toolbarLookForText: {
		color: "#ffffff",
		fontWeight: "600",
		fontSize: 20
	},
	progressBar:{
		marginTop: -7
	},
	modeButton:{
		position: "absolute",
		right: 0,
		bottom: 10,
		left: 0,
		height: 50,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#1D8668",
		borderWidth: 1,
		borderRadius: 2,
		borderColor: "#ffffff",
		marginLeft: 10,
		marginRight: 10
	},
	buttonModeText:{
		color: "#ffffff",
		fontSize: 17
	},
	toolbarModeShipped:{
		height: 56,
		backgroundColor: "#1D8668",
	},
	shipperProfileContainer:{
		height: 60,
		flexDirection: "row",
		backgroundColor: "#1D8668"
	},
	profileContainer:{
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		paddingLeft: 20,
	},
	shipperAvatar:{
		width: 50,
		height: 50,
		borderRadius: 25
	},
	shipperProfile:{
		paddingLeft: 20,
		justifyContent: "center",
		alignItems: "center"
	},
	shipperProfileText:{
		color: "#ffffff"
	},
	shipperStarContainer:{
		alignItems: "center",
		justifyContent: "center",
		flexDirection: "row"
	},
	callShipperButton:{
		width: 60,
		alignItems: "center",
		justifyContent: "center",
		borderLeftColor: "#ffffff",
		borderLeftWidth: 1,
	},
	danhGiaXepHang:{
		position: "absolute",
		height: 250,
		backgroundColor: "#1D8668",
		bottom: 0,
		left: 0,
		right: 0
	},
	headerDanhGia:{
		height: 60
	},
	bodyDanhGia:{
		flex: 1,
		backgroundColor:"#176b53",
		paddingLeft: 20,
		paddingRight: 20,
		flexDirection: "row"
	},

	footerDanhGia:{
		height: 80,
		alignItems: "center",
		justifyContent: "center"
	},
	danhGiaButton:{
		height: 60,
		alignSelf: "stretch",
		marginLeft: 20,
		marginRight: 20,
		backgroundColor: "#bdc3c7",
		borderRadius:3,
		borderWidth: 1,
		borderColor: "#7f8c8d",
		alignItems: "center",
		justifyContent: "center"
	},
	danhGiaText:{
		color: "#2c3e50",
		fontSize: 20,
		
	},
	starDanhGia:{
		flex: 1,
		alignItems: "center",
		justifyContent: "center"
	},
	typeShipContainer:{
		position: 'absolute',
		left: 0,
		bottom: 0,
		right: 0,
		height: 100,
		backgroundColor: "#ffffff",
		justifyContent: "center",
		alignItems: "center",
		paddingLeft: 20,
		paddingRight: 20
	}


});

module.exports = MainLayout;
