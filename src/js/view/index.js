import React from 'react';
import { render } from 'react-dom';
import { Provider } from 'react-redux';
import createHistory from 'history/createBrowserHistory';
import { getStoredState } from 'redux-persist';
import { ConnectedRouter as Router } from 'react-router-redux';
import configureStore from '../state/store';
import createRoutes from './routes';

const history = createHistory();

// configureStore returns a promise because it includes
// an asynchronous function to get the persisted state
export default () => {
  configureStore(history)
    .then((store) =>  {
      render(
        <Provider store={store}>
          <Router history={history}>
            { createRoutes(store) }
          </Router>
        </Provider>,
        document.querySelector('[data-react-body]'),
      );
    });
}
