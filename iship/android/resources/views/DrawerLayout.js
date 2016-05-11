"use strict";

var React = require('react-native');
var {
  TouchableHighlight,
  Text,
  StyleSheet,
  View,
  ListView,
  DrawerLayoutAndroid,
  Image,
} = React;

var ToolbarAndroid = require('ToolbarAndroid');

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
    this.props.navigator.push({
      title: title,
      name : name,                
    }); 
  },

  setLockMode: function(mode){
    this.setState({lockMode: mode});
  },

  renderMenu: function(menu){
    return(
      <View style= {{}}>
        <TouchableHighlight 
          style = {styles.menuStyle}
          underlayColor = "#dddddd"
          onPress ={()=>this.selectItems(menu.title,menu.name)}>

          <Text style = {{color : 'white'}}>{menu.title}</Text>  

        </TouchableHighlight>
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
                     
          </View>

          <View style = {styles.listView}>
            <ListView
              style={{}}
              dataSource={dataSource.cloneWithRows([
                {
                  id : 1,
                  title: 'Lịch sử hoạt động',
                  name : 'HistoryLayout'
                },                        
                {
                  id : 2,
                  title: 'Thông tin cá nhân',
                  name: 'InfLayout'
                },
                {
                  id : 3,
                  title : 'Cài đặt',
                  name : 'WelcomeLayout',
                },
                {
                  id : 4,
                  title : 'Trợ giúp',
                  name : 'WelcomeLayout',
                },
                {
                  id : 5,
                  title : 'Đăng xuất',
                  name : 'WelcomeLayout',
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
          drawerPosition = {DrawerLayoutAndroid.positions.Left}
          renderNavigationView = {()=>navView}>

          <View  style= {{flex :1}}>
            <ToolbarAndroid
            actions = {[]}
            navIcon = {{uri: "android_menu_white",isStatic: true}}
            onIconClicked = {this.openDrawer}
            style = {styles.toolbar}
            titleColor = "white"
            title = "ISHIP"
            />
              {this.props.children}
          </View>
        </DrawerLayoutAndroid>
      );
    }
  });

var styles = StyleSheet.create({
  toolbar: {
    backgroundColor: '#1D8668',
    height: 56,
  }
});

module.exports = DrawerLayout;