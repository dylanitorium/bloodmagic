import {
  compose,
  createStore,
  applyMiddleware,
  combineReducers,
} from 'redux';

import {
  persistStore,
  getStoredState,
} from 'redux-persist';

import thunk from 'redux-thunk';

import { createLogger } from 'redux-logger';

import {
  routerReducer as routing,
  routerMiddleware,
} from 'react-router-redux';

import user from './user/reducer';
import configurations from './configurations/reducer';
import artifacts from './artifacts/reducer';

export default history => (
  getStoredState({})
    .then((state) => {
      const middleware = applyMiddleware(
        thunk,
        createLogger(),
        routerMiddleware(history),
      );

      const reducer = combineReducers({
        user,
        routing,
        configurations,
        artifacts,
      });

      const store = compose(middleware)(createStore)(reducer, state);
      persistStore(store);
      return store;
    })
);
