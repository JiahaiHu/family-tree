import React from 'react'
import ReactDOM from 'react-dom'
import classnames from 'classnames'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import Login from './Login'
import Home from './Home'
import User from './User'
import { ApolloProvider, createNetworkInterface, ApolloClient } from 'react-apollo'

const endpoint = 'https://fmt.fredliang.cn'

const client = new ApolloClient({
  networkInterface: createNetworkInterface({ uri: endpoint }),
})

class App extends React.Component {
  render() {
    return (
      <ApolloProvider client={client}>
        <BrowserRouter>
          <Switch>
            <Route path="/user" component={User} />
            <Route path="/home" component={Home} />
            <Route path="/" component={Login} />
          </Switch>
        </BrowserRouter>
      </ApolloProvider>
    )
  }
}

ReactDOM.render(<App />, document.getElementById('app'))