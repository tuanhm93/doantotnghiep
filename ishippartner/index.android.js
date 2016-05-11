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
  ToastAndroid
} = React;

var ToolbarAndroid = require('ToolbarAndroid');

var WelcomeLayout = require('./android/resources/views/WelcomeLayout.js');
var RegisterLayout = require('./android/resources/views/RegisterLayout.js');
var LoginLayout = require('./android/resources/views/LoginLayout.js');
var MainLayout = require('./android/resources/views/MainLayout.js');
var ChatLayout = require('./android/resources/views/Chat.js');
var ActiveLayout = require('./android/resources/views/ActiveLayout.js');
var SwitchMode = require('./android/resources/views/SwitchMode.js');
// This is for back to previous scene
var _nav;
BackAndroid.addEventListener('hardwareBackPress', () => {
  console.log("Back press", _nav.getCurrentRoutes());
  if (_nav && _nav.getCurrentRoutes().length > 1) {
    _nav.pop();
    return true;
  }
  return false;
});

var ishippartner = React.createClass({
  render: function (){
    return (
      <Navigator
        initialRoute={{name: 'WelcomeLayout'}}
        renderScene={this.renderScene}
        configureScene={this.configureScene} />
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
        <RegisterLayout navigator={navigator} />
      );
    }
    if(name == 'LoginLayout'){
      return (
        <LoginLayout navigator={navigator} />
      );
    }
    if(name == 'MainLayout'){
      var user = route.user;
      return (
        <MainLayout
          user = {user}
          navigator = {navigator}/>
      );
    }
    if(name == 'ActiveLayout'){

      var user = route.user;
      return (
        <ActiveLayout
          user = {user}
          navigator = {navigator}/>
      );
    }

    if(name == 'SwitchMode'){
      var user = route.user;
      return (
        <SwitchMode
          user = {user}
          navigator = {navigator}/>
      );
    }
  },
});

AppRegistry.registerComponent('ishippartner', () => ishippartner);
