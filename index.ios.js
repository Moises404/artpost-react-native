import React, { Component, AppRegistry } from 'react-native'
import { Provider } from 'react-redux'
import App from './src/containers/App'
import configureStore from './src/store/configureStore'

const store = configureStore()

class Artpost extends Component {
  render() {
    return (
      <Provider store={store}>
        <App />
      </Provider>
    )
  }
}

AppRegistry.registerComponent('Artpost', () => Artpost)
