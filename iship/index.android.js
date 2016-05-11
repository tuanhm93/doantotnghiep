"use strict";

var React = require('react-native');
var {
  AppRegistry,
  StyleSheet,
  Navigator,
  AsyncStorage,
  View,
  Text,
  Image,
  BackAndroid,
  DrawerLayoutAndroid,
  ListView,
  TouchableHighlight,
  Component,
} = React;

var ToolbarAndroid = require('ToolbarAndroid');

var WelcomeLayout = require('./android/resources/views/WelcomeLayout.js');
var RegisterLayout = require('./android/resources/views/RegisterLayout.js');
var LoginLayout = require('./android/resources/views/LoginLayout.js');
var MainLayout = require('./android/resources/views/MainLayout.js');
var ChatLayout = require('./android/resources/views/Chat.js');

// This is for back to previous scene
var _nav;
BackAndroid.addEventListener('hardwareBackPress', () => {
  console.log("Back press", _nav.getCurrentRoutes());
  if (_nav && _nav.getCurrentRoutes().length > 1) {
    if(_nav.getCurrentRoutes()[_nav.getCurrentRoutes().length - 1].name == 'ChatLayout'){
      _nav.jumpBack();
       console.log("After Back press", _nav.getCurrentRoutes());
      return true;
    }
    _nav.pop();
    return true;
  }
  return false;
});

var iship = React.createClass({
  render: function (){
    return (
      <Navigator
      initialRoute={{name: 'WelcomeLayout'}}
      renderScene={this.renderScene} />
      );
  },

  renderScene: function (route, navigator){
    _nav = navigator;
    var name = route.name;
    if(name == 'WelcomeLayout'){
      return (
        <WelcomeLayout navigator={navigator} />
        );
    }
    if(name == 'RegisterLayout'){
      return (
        <View style={{flex: 1}}>
        <ToolbarAndroid style={{backgroundColor: "#1D8668", height: 56}}
        navIcon={{uri: "android_back_white",isStatic: true}}
        title="ĐĂNG KÝ"
        titleColor="#ffffff"
        action={[]}
        onIconClicked = {navigator.pop}
        />
        <RegisterLayout navigator={navigator} />
        </View>
        );
    }
    if(name == 'LoginLayout'){
      return (
        <LoginLayout navigator={navigator} />
      );
    }
    if(name == 'MainLayout'){
      var initialLocation = route.initialLocation;
      var user = route.user;
      return (
        <MainLayout
          navigator={navigator}
          initialLocation={initialLocation}
          user = {user} />
        );
    }
    if(name == 'ChatLayout'){
      var shipid = route.shipid;
      var messageBuffer = route.messageBuffer;
      return (
        <ChatLayout navigator={navigator}
          shipid = {shipid}
          messageBuffer = {messageBuffer} />
      )
    }
  },
});

const styles = StyleSheet.create({
  drawerContainer:{},
  drawerProfile:{},
  drawerNavigate:{},
  toolbar:{
    backgroundColor: '#1D8668'
  }
});

AppRegistry.registerComponent('iship', () => iship);
