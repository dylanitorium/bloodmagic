import React from 'react';
import {
  Route,
  Redirect,
} from 'react-router-dom';

export default (props) => {
  const {
    component: Component,
    store,
    redirectPath,
    ...remainingProps
  } = props;

  const {
      user: {
        currentUser,
      },
  } = store.getState();

  return <Route
    {...remainingProps}
    render={
      (routeProps) => {
        const { location } = routeProps;
        if (currentUser) {
          return <Component {...routeProps} />
        }

        return <Redirect
          to={{
            pathname: redirectPath,
            state: {
              from: location,
            },
          }}
        />
      }
    }
  />
}

