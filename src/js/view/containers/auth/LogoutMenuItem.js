import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Menu } from 'semantic-ui-react';
import { endAuthentication } from '../../../state/user/actions';

const LogoutMenuItem = ({ endAuthentication }) => (
  <Menu.Item name='logout' onClick={() => endAuthentication()} />
);

LogoutMenuItem.propTypes = {
  endAuthentication: PropTypes.func,
};

export default connect(
  () => ({}),
  { endAuthentication }
)(LogoutMenuItem);
