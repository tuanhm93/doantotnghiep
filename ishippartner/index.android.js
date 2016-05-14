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

//Common layout
var WelcomeLayout = require('./android/resources/views/WelcomeLayout.js');
var RegisterLayout = require('./android/resources/views/RegisterLayout.js');
var LoginLayout = require('./android/resources/views/LoginLayout.js');
var ActiveLayout = require('./android/resources/views/ActiveLayout.js');
var SwitchMode = require('./android/resources/views/SwitchMode.js');
//Caller layout
var CallerMainLayout = require('./android/resources/views/caller/MainLayout.js');


//Shipper Layout
var ShipperMainLayout = require('./android/resources/views/shipper/MainLayout.js');
var ShipperChooseOption = require('./android/resources/views/shipper/ChooseOption.js');
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
        />
      );
  },
  configureScene: function(route, routeStack){
    if(route.name == 'LoginLayout' || route.name == 'RegisterLayout'){
      return Navigator.SceneConfigs.FloatFromBottom;
    }
    return Navigator.SceneConfigs.PushFromRight;
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
    if(name == 'CallerMainLayout'){
      var user = route.user;
      var currentLocation = route.currentLocation;
      return (
        <CallerMainLayout
          user = {user}
          currentLocation = {currentLocation}
          navigator = {navigator}/>
      );
    }
    if(name == 'ShipperMainLayout'){
      var currentLocation = route.currentLocation;
      return (
        <ShipperMainLayout
          currentLocation = {currentLocation}
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

    if(name == 'ShipperChooseOption'){
      var user = route.user;
      return (
        <ShipperChooseOption
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
