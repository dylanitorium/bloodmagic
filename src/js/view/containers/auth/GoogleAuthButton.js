import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Icon } from 'semantic-ui-react';
import { authenticateUser } from '../../../state/user/actions';

const GoogleAuthButton = ({ authenticateUser }) => (
  <Button
    fluid
    size="large"
    color="google plus"
    onClick={() => authenticateUser('google')}
  >
    <Icon name="google" /> Login with Google
  </Button>
);

GoogleAuthButton.propTypes = {
  authenticateUser: PropTypes.func,
};

export default connect(
  () => ({}),
  { authenticateUser }
)(GoogleAuthButton);
