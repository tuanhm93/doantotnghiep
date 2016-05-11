'use strict';

var React = require('react-native');
var {
  Linking,
  Platform,
  ActionSheetIOS,
  Dimensions,
  View,
  Text,
  Navigator,
  Component,
  ToolbarAndroid,
  Vibration
} = React;

var GiftedMessenger = require('react-native-gifted-messenger');
var Communications = require('react-native-communications');
var app = require('../../../../lib/share/app.js');
var uuid = require('uuid');
var Sound = require('react-native-sound');

var STATUS_BAR_HEIGHT = Navigator.NavigationBar.Styles.General.StatusBarHeight + 60;
if (Platform.OS === 'android') {
  var ExtraDimensions = require('react-native-extra-dimensions-android');
}

var GiftedMessengerContainer = React.createClass({

	getInitialState: function(){
		this._isMounted = false;
		this._messages = this.props._messages;
		this.shipid = this.props.shipid;
		this.isNewMessageLoaded = false;

		return {
			messages: this._messages,
		};
	},
	componentWillReceiveProps: function(newProps){
		if(this.shipid != newProps.shipid){
			this.setState({
				messages: newProps._messages,
			});
			this._messages = newProps._messages;
			this.shipid = newProps.shipid;	
		}
	},

	componentDidMount: function(){
		console.log('componentDidMount: ChatLayout');
		this._isMounted = true; 
		var _self = this;

	    var socket = app.get('socket');

	    socket.on('get_message', function(message){
			_self.handleReceive(message);
	    	
			if(_self.isNewMessageLoaded){
				_self.newMessage.play();
			}
			Vibration.vibrate([0, 500], false);
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

	componentWillUnmount() {
		console.log('Unmount chat layout');
	    this._isMounted = false;
	   
	    var socket = app.get('socket');
	    socket.removeAllListeners('get_message');
	    socket.removeAllListeners('send_message');
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

  	onErrorButtonPress(message = {}) {
	    // remove the status
	    this.setMessageStatus(message.uniqueId, '');
  	},
  
  	render() {
	    return (
	      	<View style={{flex: 1}}>
		      	<ToolbarAndroid style={{height: 56, backgroundColor: "#1D8668"}}
       				navIcon={{uri: "android_back_white",isStatic: true}}
			        title="CHAT"
			        titleColor="#ffffff"
			        onIconClicked = {()=> this.props.onBackPress(false)}/>

		      	<GiftedMessenger
			        ref={(c) => this._GiftedMessenger = c}
			        styles={{
			        	flex: 1
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
			</View>
	    );
  	},
  
  	handleUrlPress(url) {
    	Linking.openURL(url);
  	},

  	// TODO
  	// make this compatible with Android
  	handlePhonePress(phone) {
	    if (Platform.OS !== 'android') {
	      var BUTTONS = [
	        'Text message',
	        'Call',
	        'Cancel',
	      ];
	      var CANCEL_INDEX = 2;
	    
	      ActionSheetIOS.showActionSheetWithOptions({
	        options: BUTTONS,
	        cancelButtonIndex: CANCEL_INDEX
	      },
	      (buttonIndex) => {
	        switch (buttonIndex) {
	          case 0:
	            Communications.phonecall(phone, true);
	            break;
	          case 1:
	            Communications.text(phone);
	            break;
	        }
	      });
	    }
  	},
  
  	handleEmailPress(email) {
    	Communications.email(email, null, null, null, null);
  	},

});

module.exports = GiftedMessengerContainer;