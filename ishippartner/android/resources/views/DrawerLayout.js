"use strict";

var React = require('react-native');
var {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  ListView,
  DrawerLayoutAndroid,
  Image,
  AsyncStorage,
  Alert
} = React;

var ToolbarAndroid = require('ToolbarAndroid');
var Icon = require('react-native-vector-icons/Ionicons');
var app = require('../../../lib/share/app.js');

var DrawerLayout = React.createClass({

  getInitialState: function(){
    var user = this.props.user;

    return {
      lockMode: 'unlocked',
      user: user
    }
  },

  openDrawer: function(){
    this.refs.drawer.openDrawer();
  },
  
  selectItems : function(title,name){ 
    var _self = this;
    if(name == 'dangxuat' ){
      AsyncStorage.removeItem('token')
        .then(function(ok){
          var socket = app.get('socket');
          socket.close();

          _self.props.navigator.resetTo({
            name: 'WelcomeLayout'
          });
        })
        .catch(function(err){

        });
      
    }
    // this.props.navigator.push({
    //   title: title,
    //   name : name,                
    // }); 
  },

  setLockMode: function(mode){
    this.setState({lockMode: mode});
  },

  renderMenu: function(menu){
    return(
      <View style= {{}}>
        <TouchableOpacity 
          style = {styles.menuStyle}
          onPress ={()=>this.selectItems(menu.title, menu.name)}>

          <View style={styles.iconMenu}>
            <Icon name={menu.icon} size={20} color = "#ffffff" />
          </View>

          <View style={styles.menuName}>
            <Text style={styles.textMenuName}>{menu.title}</Text>
          </View>

        </TouchableOpacity>
      </View>
      );
    },

    render: function(){
      console.log('On NavRender');
      var dataSource = new ListView.DataSource({
        rowHasChanged : (row1,row2) => row1!== row2,
      });

      var navView = (
        <View style = {styles.containerDrawer}>
          <View style = {styles.profile}>
              <View style = {styles.avatarContainer}>
                {this.state.user.avatar == '' ?
                  <Image style={styles.avatar} source={require('../../../public/images/avatardefault.png')}/> :
                  <Image style={styles.avatar} source={{uri: this.state.user.avatar}}/> }
              </View>

              <View style = {styles.usernameContainer}>
                <Text style = {styles.username}>{this.state.user.username}</Text>
              </View>
          </View>

          <View style = {styles.listView}>
            <ListView
              style={{}}
              dataSource={dataSource.cloneWithRows([
                  {
                    id : 1,
                    title: 'Lịch sử hoạt động',
                    name : 'HistoryLayout',
                    icon: 'map'
                  },                        
                  {
                    id : 2,
                    title: 'Thông tin cá nhân',
                    name: 'InfLayout',
                    icon: 'briefcase'
                  },
                  {
                    id : 3,
                    title : 'Cài đặt',
                    name : 'WelcomeLayout',
                    icon: 'gear-b'
                  },
                  {
                    id : 4,
                    title : 'Trợ giúp',
                    name : 'WelcomeLayout',
                    icon: 'help-buoy'
                  },
                  {
                    id : 5,
                    title : 'Đăng xuất',
                    name : 'dangxuat',
                    icon: 'log-out'
                  }
                ])
              }
              renderRow={this.renderMenu} />
          </View>
        </View>      
      );
      
      return(
        <DrawerLayoutAndroid 
          ref = "drawer"
          drawerWidth = {250}
          drawerLockMode = {this.state.lockMode}
          drawerBackgroundColor = "#2c3e50"
          drawerPosition = {DrawerLayoutAndroid.positions.Left}
          renderNavigationView = {()=>navView}>

              {this.props.children}
          
        </DrawerLayoutAndroid>
      );
    }
  });

var styles = StyleSheet.create({
  containerDrawer:{
    flex: 1,
  },
  profile:{
    paddingLeft: 10,
    height: 80,
    alignItems: "center",
    flexDirection: 'row',
    backgroundColor: '#34495e',
  },
  avatarContainer:{
    height: 50,
    width: 50,
    paddingRight: 10,
  },
  avatar:{
    height: 50,
    width: 50,
    borderRadius: 25,
  },
  usernameContainer: {
    paddingLeft: 10,
    height: 50,
    justifyContent: 'center',
  },
  username:{
    fontSize: 17,
    color: '#ffffff'
  },
  listView:{
    flex: 1,
    backgroundColor: '#2c3e50',
  },
  menuStyle:{
    paddingLeft: 10,
    height: 50,
    flexDirection: 'row',
  },
  iconMenu:{
    height: 50,
    width: 50,
    justifyContent: "center",
    alignItems: "center"
  },
  menuName:{
    justifyContent: "center",
  },
  textMenuName:{
    fontSize: 16,
    color: '#ffffff'
  }


});

module.exports = DrawerLayout;