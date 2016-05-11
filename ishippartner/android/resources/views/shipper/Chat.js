// "use strict";

// var React = require('react-native');

// var {
// 	StyleSheet,
// } = React;

// var ChatLayout = React.createClass({
// 	getInitialState: function(){

// 	},
// 	render: function(){

// 	},
// 	componentDidMount: function(){

// 	},
// });

// const styles = StyleSheet.create({

// });


// module.exports = ChatLayout;

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
} = React;

var GiftedMessenger = require('react-native-gifted-messenger');
var Communications = require('react-native-communications');
var app = require('../../../../lib/share/app.js');
var uuid = require('uuid');

var STATUS_BAR_HEIGHT = Navigator.NavigationBar.Styles.General.StatusBarHeight + 60;
if (Platform.OS === 'android') {
  var ExtraDimensions = require('react-native-extra-dimensions-android');
}

var GiftedMessengerContainer = React.createClass({
	getInitialState: function(){
		var messageBuffer = this.props.messageBuffer;
		this._messages = [];
		for(var i=0;i<messageBuffer.length;i++){
			var newMessage = {
				uniqueId: messageBuffer[i].id,
				text: messageBuffer[i].text,
				date: messageBuffer[i].date,
				position: 'left'
			}
			this._messages.push(newMessage);
		}
		this.shipid = this.props.shipid;
		this._isMounted = false;
		
		return {
			messages: this._messages,
			isLoadingEarlierMessages: false,
		    typingMessage: '',
		    allLoaded: false,
		};
	},

	componentDidMount: function(){
		var _self = this;
	    this._isMounted = true;    
	    var socket = app.get('socket');
	    socket.on('get_message', function(message){
	    	_self.handleReceive(message);
	    });
	    socket.on('send_message', function(data){
	    	var idMessage = data.id;
	    	_self.setMessageStatus(idMessage, 'Đã gửi');
	    });
	},

	componentWillUnmount() {
	    this._isMounted = false;
	    console.log('Unmount chat layout');
	     var socket = app.get('socket');
	     socket.removeAllListeners('get_message');
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

  	onErrorButtonPress(message = {}) {
	    // Your logic here
	    // re-send the failed message

	    // remove the status
	    this.setMessageStatus(message.uniqueId, '');
  	},
  
  	// will be triggered when the Image of a row is touched
  	onImagePress(message = {}) {
	    // Your logic here
	    // Eg: Navigate to the user profile
  	},
  
  	render() {
	    return (
	      <View>
		      <ToolbarAndroid style={{height: 60, backgroundColor: "#1D8668"}}
				        navIcon={{uri: "android_back_white",isStatic: true}}
				        title="CHAT"
				        titleColor="#ffffff"

				        onIconClicked = {()=> {
				        	
				        	this.props.navigator.jumpBack();
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
		        maxHeight={Dimensions.get('window').height - Navigator.NavigationBar.Styles.General.NavBarHeight - STATUS_BAR_HEIGHT}
		        loadEarlierMessagesButton={false}
		        onLoadEarlierMessages={this.onLoadEarlierMessages}
		       	keyboardDismissMode={'none'}
		       	keyboardShouldPersistTaps={false}
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