import React, {
  Component,
  ListView,
  NetInfo,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableHighlight
} from 'react-native'
import Firebase from 'firebase'
import config from '../../config'
import Item from './Item'

const itemsRef = new Firebase(`${ config.FIREBASE_ROOT }/items`)
const connectedRef = new Firebase(`${ config.FIREBASE_ROOT }/.info/connected`)

// var THUMB_URLS = [
//   require('./Thumbnails/like.png'),
//   require('./Thumbnails/dislike.png'),
//   require('./Thumbnails/call.png'),
//   require('./Thumbnails/fist.png'),
//   require('./Thumbnails/bandaged.png'),
//   require('./Thumbnails/flowers.png'),
//   require('./Thumbnails/heart.png'),
//   require('./Thumbnails/liking.png'),
//   require('./Thumbnails/party.png'),
//   require('./Thumbnails/poke.png'),
//   require('./Thumbnails/superlike.png'),
//   require('./Thumbnails/victory.png'),
// ];

export default class ArtpostGrid extends Component {
  constructor(props) {
    super(props)

    this.state = {
      newItem: ''
    }
  }

  componentWillMount() {
    this.dataSource = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2})

    this.props.loadOfflineItems()

    itemsRef.on('child_added', (snapshot) => {
      this.props.addItem(snapshot.val())
    })

    itemsRef.on('child_removed', (snapshot) => {
      this.props.removeItem(snapshot.val().id)
    })

    if (React.NativeModules.NetInfo) {
      NetInfo.isConnected.fetch().done(isConnected => {
        if (isConnected) {
          this.props.checkConnection()
        } else {
          this.props.goOffline()
        }
      })
    } else {
      this.props.checkConnection()
    }

    connectedRef.on('value', snap => {
      if (snap.val() === true) {
        this.props.goOnline()
      } else {
        this.props.goOffline()
      }
    })
  }

  // componentWillReceiveProps(nextProps) {
  //   console.log('NEXT PROPS')
  //   console.log(nextProps)

  // }

  renderRow(rowData: string, sectionID: number, rowID: number) {
    console.log(this.props.connected)
    var rowHash = Math.abs(hashCode(rowData));
    // return (
    //   <Item name={rowData.title}
    //         removable={this.props.connected}
    //         onRemove={() => this._remove(rowData.id)} />
    // )
    return (
      <TouchableHighlight underlayColor="transparent">
        <View>
          <View style={styles.row}>
            <Text style={styles.text}>
              {rowData}
            </Text>
          </View>
        </View>
      </TouchableHighlight>
    )
  }

  _add() {
    const id = Math.random().toString(36).substring(7)
    const itemRef = itemsRef.child(id)

    itemRef.set({
      id,
      title: this.state.newItem,
      time: new Date().getTime()
    })

    this.setState({newItem: ''})

    setTimeout(() => this.refs.newItem.focus(), 1)
  }

  _remove(id) {
    itemsRef.child(id).remove()
  }

  render() {
    console.log('PROPS!')
    console.log(this.props)
    let items, readonlyMessage
    if (this.props.connected) {
      items = this.props.onlineItems
    } else if (this.props.connectionChecked) {
      items = this.props.offlineItems
      readonlyMessage = <Text style={styles.offline}>Offline</Text>
    } else {
      items = []
      readonlyMessage = <Text style={styles.offline}>Loading...</Text>
    }

    return (
      <View style={styles.container}>
        {readonlyMessage}
        <TextInput placeholder="Type something amazing"
                   style={styles.newItem}
                   ref="newItem"
                   editable={this.props.connected}
                   value={this.state.newItem}
                   onChangeText={(newItem) => this.setState({newItem})}
                   onSubmitEditing={() => this._add()} />


        <ListView
          contentContainerStyle={styles.list}
          dataSource={this.dataSource.cloneWithRows(items)}
          initialListSize={21}
          pageSize={3}
          scrollRenderAheadDistance={500}
          enableEmptySections={true}
          renderRow={this.renderRow.bind(this)}
        />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 40,
    backgroundColor: '#F6F6F6'
  },
  newItem: {
    backgroundColor: '#FFFFFF',
    height: 40,
    borderColor: '#CCCCCC',
    borderWidth: 1,
    marginBottom: 10,
    marginLeft: 20,
    marginRight: 20,
    paddingLeft: 10,
    borderRadius: 5,
    fontSize: 20
  },
  offline: {
    backgroundColor: '#000000',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
    paddingTop: 5,
    paddingBottom: 5
  },
  list: {
    justifyContent: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  row: {
    justifyContent: 'center',
    padding: 5,
    margin: 3,
    width: 100,
    height: 100,
    backgroundColor: '#F6F6F6',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 5,
    borderColor: '#CCC'
  },
  thumb: {
    width: 64,
    height: 64
  },
  text: {
    flex: 1,
    marginTop: 5,
    fontWeight: 'bold'
  }
})
