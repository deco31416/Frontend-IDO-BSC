import { Route, Switch } from 'react-router-dom';

import { Provider } from 'react-redux';
import store from './redux/store';

import './App.css';

import Project from './pages/Project'

function App() {
  return (
    <Provider store={store}>
      <Switch>
        <Route path="/">
          <Project />
        </Route>
      </Switch>
    </Provider>
  );
  
}

export default App;
