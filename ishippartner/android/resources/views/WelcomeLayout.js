'use strict';

var React = require('react-native');
var {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  Animated,
  AsyncStorage,
  Modal,
  ToastAndroid,
  Alert,
} = React;


var SPRING_CONFIG = {tension: -15, friction: 5, velocity: 0}; //Soft spring
var ProgressBar = require('ProgressBarAndroid');
var Socket = require('../../../lib/socket/socket.js');
var consts = require('../../../lib/consts/consts');
var app = require('../../../lib/share/app.js')
var  WelcomeLayout = React.createClass ({
  getInitialState: function() {
    return {
        pan: new Animated.ValueXY(),
        modalVisible: false,
    };
  },
  alertError(title, body, buttonText){
    Alert.alert(
            title,
            body,
            [
              {text: buttonText},
            ]
        );
  },
  autoLogin: function(token){
    var _self = this;
    this._setModalVisible(true);
    var socket = new Socket('', token);

    socket.connect(function(err, data){
      _self._setModalVisible(false);
      if(err){
        _self.alertError('Thông báo', 'Đã có lỗi xảy ra vui lòng thử lại!', 'OK');
      }else{
        data = data || {};
        if(data.code == consts.CODE.SUCCESS){
          var user = data.user;
  
          var route;
          if(user.userType == consts.USER_TYPE.ADMIN){
            route = {name: 'AdminLayout'};
          }else{
            if(user.actived == 0){
              route = {name: 'ActiveLayout', user: data.user};
            }else{
              route = {name: 'SwitchMode', user: data.user};
            }
          }
          _self.props.navigator.resetTo(route);

        }else{
          var socket = app.get('socket');
          socket.close();
          _self.alertError('Thông báo', 'Phiên làm việc đã hết hạn vui lòng đăng nhập lại!', 'OK');
          _self.openNormal();
          AsyncStorage.removeItem('token');
        }
      }
    });
  },

  openNormal: function(){
    Animated.spring(this.state.pan, {
          ...SPRING_CONFIG,
          toValue: {x: 0, y: -90}                       
    }).start(); 
  },

  componentDidMount: function() {
    var _self = this;
    AsyncStorage
      .getItem('token')
      .then(function(token){
        // return self.openNormal(); 
        if(token){
          _self.autoLogin(token);
        }else{
          _self.openNormal();  
        }
      })
      .catch(function(error){
        _self.openNormal();     
      });
  },

  _setModalVisible: function(value){
    this.setState({
      modalVisible: value
    });
  },

  render() {
    return (
      <Image source={require('../../../public/images/IShip.jpg')} style={styles.backgroundImage}>
        <View style={{flex: 1}} />
        
        <Modal
          visible={this.state.modalVisible}
          onRequestClose={()=>this._setModalVisible(false)} >

          <View style={{flex: 1}} >
            <View style={{flex: 1}} />
            <View style={{height: 130, alignItems: "center", justifyContent: "center"}} >
              <ProgressBar styleAttr="Normal" />
              <Text>Đang đăng nhập</Text>
            </View>
          </View>
        </Modal>

        <Animated.View style={this.getStyle()}>
          <TouchableOpacity
            onPress={this.loginTouch}
            style={[styles.button, styles.loginButton]}>

            <Text style={[styles.loginText, styles.buttonText]}>ĐĂNG NHẬP</Text>

          </TouchableOpacity>

          <TouchableOpacity
            onPress={this.registerTouch} 
            style={[styles.button, styles.registerButton]} >

              <Text style={[styles.registerText, styles.buttonText]}>ĐĂNG KÝ</Text>

          </TouchableOpacity>
        </Animated.View>
      </Image>
    );
  },

  getStyle: function() {
    return [
      styles.containerButton, 
      {
        transform: this.state.pan.getTranslateTransform()
      }
    ];
  },

  loginTouch(){
    var navigator = this.props.navigator;
    var route = {name: 'LoginLayout'};
    return navigator.push(route);
  },

  registerTouch(){
    var navigator = this.props.navigator;
    var route = {name: 'RegisterLayout'};
    return navigator.push(route);
  },
});

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
    width: null,
    height: null,
  },
  containerButton:{
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -90,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    height: 90
  },
  button: {
    flex: 1,
    height: 50,
    borderRadius: 2,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 10,
    paddingBottom: 10
  },
  loginButton: {
    borderWidth: 1,
    marginLeft: 20,
    marginRight: 10,
    borderColor: "#1D8668",
  },
  registerButton: {
    marginLeft: 10,
    marginRight: 20,
    backgroundColor: "#1D8668"
  },
  buttonText:{
    fontSize: 17,
  },
  loginText: {
    color: "#1D8668"
  },
  registerText: {
    color: "#ffffff"
  }
});


module.exports = WelcomeLayout;