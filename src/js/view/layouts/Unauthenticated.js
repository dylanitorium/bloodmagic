import React, { Component } from 'react';

import {
  Grid,
  Header,
  Divider,
} from 'semantic-ui-react';

import GoogleAuthButton from '../containers/auth/GoogleAuthButton';
import GithubAuthButton from '../containers/auth/GithubAuthButton';

export default () => (
  <Grid
    textAlign="center"
    style={{ height: '100%' }}
    verticalAlign="middle"
  >
    <Grid.Column style={{ maxWidth: 450 }}>
      <Header
        as="h2"
        color="black"
        textAlign="center"
      >
        bloodmagic.
      </Header>
      <GoogleAuthButton />
    </Grid.Column>
  </Grid>
);

