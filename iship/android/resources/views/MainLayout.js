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
	Alert,
	Image,
	Modal,
	Navigator,
	Vibration
} = React;

var MapView = require('react-native-maps');
var DrawerLayout = require('./DrawerLayout');
var app = require('../../../lib/share/app');
var ProgressBar = require('ProgressBarAndroid');
var ProgressCustom = require('react-native-progress');
var Icon = require('react-native-vector-icons/Ionicons');
var consts = require('../../../lib/consts/consts');
var GiftedMessenger = require('react-native-gifted-messenger');
var Sound = require('react-native-sound');
var uuid = require('uuid');
var Communications = require('react-native-communications');

var MainLayout = React.createClass({
	watchId: null,
	hasLoadLocation: false,
	currentLocation: {},
	currentLocationDelta: {},
	locationDefault: {
		latitude: 21.0227,
		longitude: 105.8019,
	},
	locationDeltaConfirm:{
		latitudeDelta: 0.0026736060809362527,
		longitudeDelta: 0.001844353973865509
	},
	locationDeltaDefault: {
		latitudeDelta: 0.01549886894352781,
		longitudeDelta: 0.010693632066249847
	},
	countdountInterval: null,
	shipid: '',
	hasLoadChat: false,
	messageBuffer: [],
	_messages: [],

	getInitialState: function(){
		console.log("Initial state: MainLayout");
		var state;
		if(this.props.initialLocation){
			var initialLocation = this.props.initialLocation;
			state = {
				initialRegion:{
					latitude: initialLocation.latitude,
					longitude: initialLocation.longitude,
					latitudeDelta: this.locationDeltaDefault.latitudeDelta,
					longitudeDelta: this.locationDeltaDefault.longitudeDelta,
				}
			};
		}else{
			state = {
				initialRegion: {
					latitude: this.locationDefault.latitude,
					longitude: this.locationDefault.longitude,
					latitudeDelta: this.locationDeltaDefault.latitudeDelta,
					longitudeDelta: this.locationDeltaDefault.longitudeDelta,
				},
			}
		}

		state.nameOfCurrentLocation = 'Chưa rõ vị trí hiện tại';
		state.clientLocation = {
			longitude: 108.8019,
			latitude: 21.0227
		};
		state.clientProfile = null;
		state.mode = 1;
		state.titleModeText = '';
		state.modeText = 'BẮT ĐẦU';
		state.countdount = 15;
		state.shipStatus = '';
		state.colors = [];
		state.showInfShipCurrent = false;
		state.openChat = false;
		state.messages = this._messages;
		state.hasNotify = false;
		return state;	
	},

	render: function() {
		return (
			<DrawerLayout
				ref="drawer"
				style={styles.drawer}
				user={this.props.user} >

				{this.state.mode == 2 || this.state.mode == 3 ?
					<View style={styles.toolbarOnlineContainer}>
						<View style={styles.toolbarOnline}>
							<Text style={styles.toolBarOnlineText}>{this.state.titleModeText}</Text>
						</View>
						<View style={styles.progressBar}>
							<ProgressBar color="#000000" styleAttr="Horizontal" />
						</View>
					</View> : null }

				{this.state.mode == 5 || this.state.mode == 6 ||  this.state.mode == 7 || this.state.mode == 8?
					<ToolbarAndroid
						title={this.state.titleModeText}
						style={styles.toolbarModeShipping}
						onActionSelected={this.toolbarAction}
						actions={[
							{title: 'Chat'},
							{title: 'Thông tin chuyến ship'},
							{title: 'Hủy ship'}
						]}
						titleColor="#ffffff" /> : null }
				{this.state.hasNotify ?
					<View style={{position: "absolute", top: 2, right: 5, height: 15, width: 18}}>
						<Icon name = "chatbox-working" size={20} color="#ff0000" />
					</View> : null}
				<View style={{flex: 1}}>
				<MapView 
					ref = "map"
					style={ styles.map }
					initialRegion={this.state.initialRegion}
					showsUserLocation={true}
					onRegionChange = {this.changeRegion}
					mapType="terrain">
					
					<MapView.Marker
						coordinate={this.state.clientLocation} >
						<Icon name="ios-location" size={45} color="#1D8668" />
					</MapView.Marker>

				</MapView>
				</View>

				<View style={styles.containerInMap}>
					<View style={styles.showCurrent}>
						<Text style={styles.showCurrentTitle}>VỊ TRÍ HIỆN TẠI</Text>
						<Text style={styles.showCurrentName}>{this.state.nameOfCurrentLocation}</Text>
					</View>
					{this.state.mode == 1 || this.state.mode == 2?
						<TouchableOpacity
							style={styles.buttonSwitch} 
							onPress={this.buttonSwitch} >
							<Text style={styles.textSwitch}>{this.state.modeText}</Text>
						</TouchableOpacity> : null}
				</View>

				{this.state.mode == 5 || this.state.mode == 6 ||  this.state.mode == 7 || this.state.mode == 8 ?
					<View style={styles.shipContainer}>
						<TouchableOpacity style={styles.shipStatus}
							onPress={this.changeStatusShip}>
							<Text style={[styles.text, styles.shipStatusText]}>{this.state.shipStatus}</Text>
						</TouchableOpacity>
						<TouchableOpacity
						    onPress = {()=>{
						    	if(this.state.clientProfile.phoneNumber != ''){
						    		Communications.phonecall(this.state.clientProfile.phoneNumber,  true);
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
										{this.state.clientProfile.avatar == '' ?
											<Image style={styles.avatarRequest} source={require('../../../public/images/avatardefault.png')}/> :
											<Image style={styles.avatarRequest} source={{uri: this.state.clientProfile.avatar}}/> }

										<View style={styles.infUser}>
											<Text style={[styles.text, styles.usernameRequest]}>{this.state.clientProfile.username}</Text>
											<View style={styles.starContainer}>
												<Text style={[styles.text, styles.star]}>3.8  </Text>
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

				{this.state.mode == 4 ?
					<View style={styles.requestContainer}>
						<View style={styles.headerRequest}>
							{this.state.clientProfile.avatar == '' ?
								<Image style={styles.avatarRequest} source={require('../../../public/images/avatardefault.png')}/> :
								<Image style={styles.avatarRequest} source={{uri: this.state.clientProfile.avatar}}/> }

							<View style={styles.infUser}>
								<Text style={[styles.text, styles.usernameRequest]}>{this.state.clientProfile.username}</Text>
								<View style={styles.starContainer}>
									<Text style={[styles.text, styles.star]}>3.8  </Text>
									<Icon name = "android-star" size={20} color="#ffffff"/>
								</View>
							</View>
							
						</View>
						<View style={styles.bodyRequest}>
							<View style={styles.countDountContainer}>
								<Text style={[styles.text]}>{this.state.countdount}</Text>
							</View>
					
							
							<View style={{flex: 1}}>
							</View>
							
								
							
							<View style={styles.infoDes}>
								<View style={{marginBottom: 10}}>
									<Text style={[styles.text, styles.textInf]}>1 Phút</Text>
								</View>
								<View>
									<Text style={[styles.text, styles.textInf]}>Thôn Đa Ngưu, Xã Tân Tiến, Huyện Văn Giang, Tỉnh Hưng Yên</Text>
								</View>
							</View>
						</View>
						<View style={styles.footerRequest}>
							<TouchableOpacity 
								style={[styles.buttonRequest, styles.acceptButton]}
								onPress={this.onAccept}>

								<Text style={[styles.text, styles.acceptText]}>CHẤP NHẬN</Text>
							</TouchableOpacity>

							<TouchableOpacity 
								style={[styles.buttonRequest, styles.rejectButton]}
								onPress={this.onReject}>
								<Text style={[styles.text, styles.rejectText]}>BỎ QUA</Text>
							</TouchableOpacity>
						</View>

					</View>
				 : null }
				 {this.state.showInfShipCurrent ?
				 	<View style={styles.currentShipContainer}>
				 		<View style={styles.headerCurrentShip}>
				 			<TouchableOpacity style={{height: 56, width: 56, justifyContent: "center", alignItems: "center"}}
				 				onPress={()=>this.setState({showInfShipCurrent: false})}>
				 				<Icon name = "android-close" size={30} color="#ffffff" />
				 			</TouchableOpacity>
				 			<View style={{position: "absolute", top: 0, left: 0, right: 0, height: 56, justifyContent: 'center', alignItems: 'center'}}>
				 				<Text style={{fontSize: 20, color: "#ffffff"}}>CHUYẾN SHIP HIỆN TẠI</Text>
				 			</View>
				 		</View>
				 		<View style={styles.bodyCurrentShip}>
				 			<View style={{alignItems: "center"}}>
				 				<Text style={{color: "#ffffff", fontSize: 20}}>KHÁCH HÀNG</Text>
				 				<View style={{marginBottom: 10, borderWidth: 1, borderColor: "#ffffff", alignItems:"center", justifyContent: "center", flexDirection: "row", height: 60, alignSelf: "stretch", marginLeft: 20, marginRight: 20, }}>
				 					{this.state.clientProfile.avatar == '' ?
											<Image style={styles.avatarRequest} source={require('../../../public/images/avatardefault.png')}/> :
											<Image style={styles.avatarRequest} source={{uri: this.state.clientProfile.avatar}}/> }

										<View style={styles.infUser}>
											<Text style={[styles.text, styles.usernameRequest]}>{this.state.clientProfile.username}</Text>
										<View style={styles.starContainer}>
											<Text style={[styles.text, styles.star]}>3.8  </Text>
											<Icon name = "android-star" size={20} color="#ffffff"/>
										</View>
									</View>
				 				</View>
				 				<Text style={{color: "#ffffff", fontSize: 20}}>ĐIỂM HẸN</Text>
				 				<View style={{borderWidth: 1, borderColor: "#ffffff", alignItems:"center", justifyContent: "center", height: 60, alignSelf: "stretch", marginLeft: 20, marginRight: 20, }}>
				 					<Text style={{fontSize: 18, color: "#ffffff", textAlign: "center"}}>Thôn Đa Ngưu, Xã Tân Tiến, Huyện Văn Giang, Tỉnh Hưng Yên</Text>
				 				</View>
				 			</View>
				 		</View>
				 	</View> : null}

				 	{this.state.openChat ? 
						<View style={{position: "absolute", top: 0, left: 0, right: 0, bottom: 0}}>
							<ToolbarAndroid style={{height: 60, backgroundColor: "#1D8668"}}
			       				navIcon={{uri: "android_back_white",isStatic: true}}
						        title="CHAT"
						        titleColor="#ffffff"

						        onIconClicked = {()=> {
						        	this.setState({
						        		openChat: false,
						        	})
							     }}/>
					      	<GiftedMessenger
						        ref={(c) => this._GiftedMessenger = c}
						    
						        styles={{
						        	flex: 1,
						          	bubbleRight: {
							            marginLeft: 70,
							            backgroundColor: '#007aff',
						          	},
						        }}
						        
						        autoFocus={true}
						        messages={this.state.messages}
						        handleSend={this.handleSend}
						        onErrorButtonPress={this.onErrorButtonPress}
						        maxHeight={Dimensions.get('window').height - Navigator.NavigationBar.Styles.General.NavBarHeight- 30}
						        loadEarlierMessagesButton={false}
						        onLoadEarlierMessages={this.onLoadEarlierMessages}
						       	keyboardDismissMode={'none'}
						       	keyboardShouldPersistTaps={true}
						        onImagePress={this.onImagePress}
						        displayNames={true}
						        parseText={true} // enable handlePhonePress, handleUrlPress and handleEmailPress
						        handlePhonePress={this.handlePhonePress}
						        handleUrlPress={this.handleUrlPress}
						        handleEmailPress={this.handleEmailPress}
						        typingMessage={this.state.typingMessage}
					      	/>
						</View> : null }
			</DrawerLayout>
		);
	},
	toolbarAction: function(index){
		var socket = app.get('socket');
		if(index == 0){
			this.setState({
				openChat: true,
				hasNotify: false,
			})
		}else if(index == 2){
			socket.emit('cancel_ship', {shipid: this.shipid});
			this.switchMode(8);
		}else if (index == 1){
			this.setState({
				showInfShipCurrent: true
			});
		}
	},
	changeRegion: function(region){
		var socket = app.get('socket');
		console.log(region);
		
	},
	switchMode: function(mode){
		var _self = this;
		var previousMode = this.state.mode;
		if(mode == 2){
			if(previousMode == 1){
				this.setState({
					mode: 2,
					modeText: 'KẾT THÚC',
					titleModeText: 'ĐANG ĐỢI YÊU CẦU'
				});
				this.refs.drawer.setLockMode("locked-closed");
			}else if(previousMode == 3){
				this.setState({
					mode: 2,
					titleModeText: 'ĐANG ĐỢI YÊU CẦU'
				});
			}else if (previousMode == 4){
				this.setState({
					mode: 2
				});
			}else if (previousMode == 5 || previousMode == 6 || previousMode == 7 || previousMode == 8){
				this.setState({
					mode: 2,
					titleModeText: 'ĐANG ĐỢI YÊU CẦU'
				})
			}
		} else if(mode == 3){
			this.setState({
				mode: 3,
				titleModeText: 'ĐANG HỦY YÊU CẦU'
			})
		} else if(mode == 1){
			this.setState({
				mode: 1,
				modeText: 'BẮT ĐẦU'
			});
			this.refs.drawer.setLockMode("unlocked");
		} else if(mode == 4){
			this.setState({
				mode: 4,
				countdount: 15
			});
			
			this.countdountInterval = setInterval(function(){
				_self.setState({
					countdount: _self.state.countdount - 1
				});
				if(_self.state.countdount == 0){
					_self.switchMode(2);
					clearInterval(_self.countdountInterval);
				}
			}, 1000);
		} else if(mode == 5){
			this.setState({
				mode: 5,
				titleModeText: 'ISHIP',
				shipStatus: 'Tôi đã đến?'
			})
		} else if(mode == 6){
			this.setState({
				mode: 6,
				shipStatus: 'Bắt đầu ship?'
			});
		}else if(mode == 7){
			this.setState({
				mode: 7,
				shipStatus: 'Đã ship xong?'
			});
		}else if(mode == 8){
			this._messages = [];
			this.setState({
				mode: 8,
				colors: ["#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff"],
				messages: this._messages,
				openChat: false,
				hasNotify: false,
			});
		}
	},
	buttonSwitch: function(){
		var _self = this;
		var socket = app.get('socket');

		if(this.state.mode == 1){
			if(this.currentLocation.latitude != undefined){
				socket.emit('go_online', this.currentLocation);
				_self.switchMode(2);
			}else{
				Alert.alert(
					'Lỗi',
					'Chưa xác định được vị trí hiện tại',
					[
						{text: 'OK'},
					]
				);
			}
		}else if(this.state.mode == 2){
			_self.switchMode(3);
			socket.emit('go_offline', function(data){
				if(data.code == consts.CODE.SUCCESS){
					_self.switchMode(1);
				}else{
					_self.switchMode(2);
				}
			});
		}
	},
	changeStatusShip: function(){
		var socket = app.get('socket');

		var _self = this;
		var mode = this.state.mode;
		if(mode == 5){
			socket.emit('has_arrived', {shipid: this.shipid});
		}else if(mode == 6){
			socket.emit('start_ship', {shipid: this.shipid});
		}else if(mode == 7){
			socket.emit('finish_ship', {shipid: this.shipid});
		}
		this.switchMode(mode + 1);
	},
	onAccept: function(){
		var socket = app.get('socket');
		socket.emit('have_client', {code: consts.CODE.ACCEPT});
		clearInterval(this.countdountInterval);
		this.switchMode(2);
	},

	onReject: function(){
		var socket = app.get('socket');
		socket.emit('have_client', {code: consts.CODE.REJECT});
		clearInterval(this.countdountInterval);
		this.switchMode(2);
	},

	componentDidMount: function(){
		console.log("componentDidMount");
		var _self = this;
		var socket = app.get('socket');

		this.watchID = navigator.geolocation.watchPosition((position) => {
			var longitude = position.coords.longitude;
			var latitude = position.coords.latitude;
			this.currentLocation.latitude = latitude;
			this.currentLocation.longitude = longitude;
			this.setState({nameOfCurrentLocation:"lat: "+latitude+" long:"+longitude});
			var data = {};
			if((this.state.mode != 1)&&(this.state.mode != 5)){
				data.latitude = latitude;
				data.longitude = longitude;
				socket.emit("update_location_shipper", data);
			}else if(this.state.mode == 5){
				data.shipid = _self.shipid;
				data.latitude = latitude;
				data.longitude = longitude;
				socket.emit("update_location_shipper", data);
			}
		});

		socket.on('have_client', function(data){
			_self.setState({
				clientProfile: data.user,
				clientLocation: data.startPoint,
				endPoints: data.endPoints
			});
			_self.switchMode(4);
		});

		socket.on('establish', function(data){
			_self.shipid = data.shipid;
			_self.switchMode(5);
		});

		socket.on('cancel_ship', function(){
			_self.switchMode(8);
		});

		socket.on('get_message', function(message){
			_self.handleReceive(message);
	    	
			if(_self.isNewMessageLoaded){
				_self.newMessage.play();
			}
			Vibration.vibrate([0, 500], false);
			if(!_self.state.openChat){
				_self.setState({hasNotify: true});
			}
		});

		socket.on('send_message', function(data){
	    	var idMessage = data.id;
	    	_self.setMessageStatus(idMessage, 'Đã gửi');
	    });

	    this.newMessage = new Sound('newmessage.mp3', Sound.MAIN_BUNDLE, function(err){
			if(!err){
				_self.isNewMessageLoaded = true;
			}
		});
	},
	setMessageStatus(uniqueId, status) {
	    let messages = [];
	    let found = false;
	    
	    for (let i = 0; i < this._messages.length; i++) {
	      if (this._messages[i].uniqueId === uniqueId) {
	        let clone = Object.assign({}, this._messages[i]);
	        clone.status = status;
	        messages.push(clone);
	        found = true;
	      } else {
	        messages.push(this._messages[i]);
	      }
	    }
	    
	    if (found === true) {
	      this.setMessages(messages);
	    }
    },
     setMessages(messages) {
	    this._messages = messages;
	    
	    // append the message
	    this.setState({
	      messages: messages,
	    });
  	},
  
  	handleSend(message = {}) {
    	var socket = app.get('socket');
    	
	    // Your logic here
	    // Send message.text to your server
	    
	    message.uniqueId = uuid.v1(); // simulating server-side unique id generation
	    socket.emit('send_message', {shipid: this.shipid, text: message.text, id: message.uniqueId});
	    this.setMessages(this._messages.concat(message));
	    this.setMessageStatus(message.uniqueId, 'Đang gửi');
  	},
 
  
  	handleReceive(message = {}) {
  		var newMessage = {
  			uniqueId: message.id,
  			text: message.text,
  			position: 'left',
  			date: new Date(),
  		}
	    
	    this.setMessages(this._messages.concat(newMessage));
  	},
	danhGia: function(){
		var socket = app.get('socket');
		var howMuchStar = 0;
		var colors = this.state.colors;
		for(var i=0;i<colors; i++){
			if(colors[i] == "#FFDF00"){
				howMuchStar++;
			}else{
				break;
			}
		}
		socket.emit('star', {userid: this.state.clientProfile._id, shipid: this.shipid, star: howMuchStar});
		this.switchMode(2);
		socket.emit('go_online', this.currentLocation);
	},
	howMuchStar: function(number){
		var colors=["#ffffff", "#ffffff", "#ffffff", "#ffffff", "#ffffff"];
		for(var i=0;i < number ;i++){
			colors[i] = "#FFDF00";
		}

		this.setState({
			colors: colors
		})
	}
});

const styles = StyleSheet.create({
	text:{
		color: "#ffffff"
	},
	drawer: {
		flex: 1,
	},

	map: {
		flex: 1,
	},
	containerInMap:{
		position: 'absolute',
		top: 56,
		left: 0,
		right: 0,
		bottom: 0,
	},
	showCurrent: {
		alignItems: "center",
		justifyContent: "center",
		marginLeft: 10,
		marginRight: 10,
		marginTop: 10,
		borderWidth: 1,
		borderColor: "#ffffff",
		borderRadius: 2,
		backgroundColor: "#1D8668",
		height: 56
	},
	showCurrentTitle: {
		fontSize: 8,
		color: '#ecf0f1',
	},
	showCurrentName:{
		color: '#ffffff',
		fontSize: 17
	},
	buttonSwitch:{
		position: 'absolute',
		bottom: 30,
		left: 0,
		right: 0,
		height: 50,
		alignItems: "center",
		justifyContent: "center",
		marginLeft: 10,
		marginRight: 10,
		backgroundColor: "#1D8668",
		borderWidth: 1,
		borderColor: "#ffffff",
		borderRadius: 2,
	},
	textSwitch:{
		fontSize: 20,
		color: "#ffffff"
	},
	toolbarOnlineContainer: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		height: 56
	},
	toolbarOnline:{
		height: 56,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "#1D8668"
	},
	toolBarOnlineText: {
		color: "#ffffff",
		fontWeight: "600",
		fontSize: 20
	},
	progressBar:{
		marginTop: -7
	},
	requestContainer:{
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: "#1D8668"
	},
	headerRequest:{
		height: 60,
		alignItems: "center",
		justifyContent: "center",
		flexDirection: "row"
	},
	avatarRequest:{
		height: 50,
		width: 50,
		borderRadius: 25,
		marginRight: 15,
	},
	infUser: {
		paddingLeft: 15,
		height: 50,
		justifyContent: "center"
	},
	usernameRequest:{
		color: "#ffffff"
	},
	starContainer:{
		alignItems: "center",
		justifyContent: "center",
		flexDirection: "row"
	},
	star:{
		color: "#ffffff"
	},
	bodyRequest:{
		flex: 1,
		alignItems: "center"
	},
	countDountContainer:{
		height: 50,
		width: 50,
		borderRadius: 25,
		borderWidth: 1,
		borderColor: "#ffffff",
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 20
	},
	infoDes:{
		marginBottom: 20,
		width: 250,
		marginTop: 20,
		justifyContent: "center",
		alignItems: "center"
	},
	textInf:{
		color: "#ffffff",
		textAlign: "center"
	},
	footerRequest:{
		flexDirection: "row",
		height: 50,
	},
	buttonRequest:{
		flex: 1,
		height: 50,
		paddingLeft: 10,
		paddingRight: 10,
		justifyContent: "center",
		alignItems: "center"
	},
	acceptButton:{
		backgroundColor:"#ffffff"
	},
	acceptText:{
		color: "#000000"
	},
	rejectButton:{
		backgroundColor: "#000000"
	},
	rejectText:{
		color: "#ffffff"
	},
	toolbarModeShipping:{
		height: 56,
		backgroundColor: "#1D8668",
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
	},
	shipContainer:{
		height: 60,
		flexDirection: "row",
		backgroundColor: "#1D8668"
	},
	shipStatus:{
		flex: 1,
		justifyContent: "center",
		alignItems: "center"
	},
	shipStatusText:{
		fontSize: 20
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
	profileContainer:{
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		paddingLeft: 20,
	},
	currentShipContainer:{
		position: "absolute",
		top: 0,
		left: 0,
		bottom: 0,
		right: 0,
		backgroundColor: "#1D8668",
		paddingLeft: 20
	},
	headerCurrentShip:{
		height: 56,
	},
	bodyCurrentShip:{
		flex: 1
	}
});

module.exports = MainLayout;