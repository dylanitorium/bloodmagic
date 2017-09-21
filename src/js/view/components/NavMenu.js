import React from 'react';
import { Container, Menu } from 'semantic-ui-react';
import LogoNavItem from '../containers/nav/LogoNavItem';
import LogoutMenuItem from '../containers/auth/LogoutMenuItem';

export default () => (
  <Menu fixed="top" inverted>
    <Container>
      <LogoNavItem />
      <Menu.Menu position="right">
        <LogoutMenuItem />
      </Menu.Menu>
    </Container>
  </Menu>
);
