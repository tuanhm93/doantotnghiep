'use strict';

var React = require('react-native');
var {
  StyleSheet,
  View,
  Text,
  Image,
  Dimensions,
  TouchableHighlight,
  TouchableOpacity
} = React;

var  WelcomeLayout = React.createClass ({
  render() {
    return (
      <Image source={require('../../../public/images/welcomebackground.jpg')} style={styles.backgroundImage}>
        <View style={styles.logo}>
          <Text style={styles.textLogo}>ISHIP</Text>
        </View>

      <View style={styles.containerButton}>
          <TouchableHighlight
            onPress={this.loginTouch}
            style={[styles.button, styles.loginButton]}
            underlayColor="#000000" >

            <Text style={[styles.loginText, styles.buttonText]}>ĐĂNG NHẬP</Text>

          </TouchableHighlight>

          <TouchableOpacity
            onPress={this.registerTouch} 
            style={[styles.button, styles.registerButton]} >

              <Text style={[styles.registerText, styles.buttonText]}>ĐĂNG KÝ</Text>

          </TouchableOpacity>
        </View>
      </Image>
    );
  },

  loginTouch(){
    var navigator = this.props.navigator;
    var route = {name: 'LoginLayout'};
    return navigator.push(route);
  },

  registerTouch(){
  	console.log('hohoho');
    var navigator = this.props.navigator;
    var route = {name: 'RegisterLayout'};
    return navigator.push(route);
  },
});

const styles = StyleSheet.create({
	backgroundImage: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: null,
    height: null,
  },
  logo: {
    width: 100,
    height: 100,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    borderRadius: 1
  },
  textLogo: {
    color: '#000000',
    fontSize: 20,
    fontWeight: 'bold',
    textShadowColor: '#000000',
    textShadowRadius: 10,
    textShadowOffset: {width: 1, height: 2}
  },
  containerButton:{
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    height: 70
  },
  button: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
    marginRight: 10,
    paddingTop: 10,
    paddingBottom: 10
  },
  loginButton: {
    borderWidth: 3,
    borderColor: "#000000",

  },
  registerButton: {
    borderWidth: 3,
    backgroundColor: "#000000"
  },
  buttonText:{
    fontSize: 17,
    fontWeight: "bold",
  },
  loginText: {
    color: "#000000"
  },
  registerText: {
    color: "#ffffff"
  }
});


module.exports = WelcomeLayout;