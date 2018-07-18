import React from 'react';
import ReactDOM from 'react-dom';
import classnames from 'classnames';
import { BrowserRouter, Route, Switch } from 'react-router-dom'
import Login from './Login';
import Home from './Home';
import User from './User';

class App extends React.Component {
  render() {
    return (
      <BrowserRouter>
        <Switch>
          <Route path="/user" component={User} />
          <Route path="/home" component={Home} />
          <Route path="/" component={Login} />
        </Switch>
      </BrowserRouter>
    );
  }
}

ReactDOM.render(<App />, document.getElementById('app'));