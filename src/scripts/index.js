import React from 'react'
import ReactDOM from 'react-dom'
import classnames from 'classnames'
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import { ApolloProvider } from 'react-apollo'
import { ApolloClient } from 'apollo-client'
import { createHttpLink } from 'apollo-link-http'
import { setContext } from 'apollo-link-context'
import { InMemoryCache } from 'apollo-cache-inmemory'
import Login from './Login'
import Home from './Home'
import User from './User'

const endpoint = 'https://fmt.fredliang.cn'

const httpLink = createHttpLink({
  uri: endpoint,
});

const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists
  const token = localStorage.getItem('token');
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    }
  }
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
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