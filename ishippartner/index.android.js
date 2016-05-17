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
var HistoryLayout = require('./android/resources/views/HistoryLayout.js');
var UserProfileLayout = require('./android/resources/views/UserProfileLayout.js');
var ChangePasswordLayout = require('./android/resources/views/ChangePasswordLayout.js');
var TypeEmailLayout = require('./android/resources/views/getInfBack/TypeEmailLayout.js');
var TypeCodeLayout = require('./android/resources/views/getInfBack/TypeCodeLayout.js');
var TypeNewPassword = require('./android/resources/views/getInfBack/TypeNewPassword.js');
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
      var email = route.email;
      return (
        <LoginLayout
          email = {email}
          navigator={navigator} />
      );
    }
    if(name == 'CallerMainLayout'){
      var user = route.user;
      var currentLocation = route.currentLocation;
      var workMode = route.workMode;
      return (
        <CallerMainLayout
          user = {user}
          workMode = {workMode}
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
      var workMode = route.workMode;

      return (
        <ShipperChooseOption
          user = {user}
          workMode = {workMode}
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

    if(name == 'HistoryLayout'){
      var workMode = route.workMode;
      return (
        <HistoryLayout
          workMode = {workMode}
          navigator = {navigator} />
      );
    }

    if(name == 'UserProfileLayout'){
      var user = route.user;
      return (
        <UserProfileLayout
          user = {user}
          navigator = {navigator} />
      );
    }

    if(name == 'TypeEmailLayout'){
      return (
        <TypeEmailLayout
          navigator = {navigator} />
      )
    }

    if(name == 'TypeCodeLayout'){
      var email = route.email;
      return (
        <TypeCodeLayout
          email = {email}
          navigator = {navigator} />
      )
    }

    if(name == 'TypeNewPassword'){
      var email = route.email;
      return (
        <TypeNewPassword
          email = {email}
          navigator = {navigator} />
      )
    }

    if(name == 'ChangePasswordLayout'){
      var email = route.email;
      return (
        <ChangePasswordLayout
          email = {email}
          navigator = {navigator} />
      )
    }
  },
});

AppRegistry.registerComponent('ishippartner', () => ishippartner);
