import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { Menu } from 'semantic-ui-react';

const LogoNavItem = ({ push }) => (
  <Menu.Item as="a" header onClick={() => push('/')}>bloodmagic</Menu.Item>
);

LogoNavItem.propTypes = {
  push: PropTypes.func,
};

export default connect(
  () => ({}),
  { push }
)(LogoNavItem);
