import React from 'react';
import { Route } from 'react-router';
import AuthenticatedRoute from './AuthenticatedRoute';
import UnauthenticatedRoute from './UnauthenticatedRoute';

import {
  Authenticated,
  Unauthenticated
} from '../layouts';

export default store => (
  <div>
    <AuthenticatedRoute path="/" redirectPath="/login" store={store} component={Authenticated} />
    <UnauthenticatedRoute path="/login" redirectPath="/" store={store} component={Unauthenticated} />
  </div>
);
