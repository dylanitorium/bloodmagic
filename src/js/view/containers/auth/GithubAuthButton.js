import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Icon } from 'semantic-ui-react';
import { authenticateUser } from '../../../state/user/actions';

const GithubAuthButton = ({ authenticateUser }) => (
  <Button
    fluid
    size="large"
    color="grey"
    onClick={() => authenticateUser('github')}
  >
    <Icon name="github" /> Login with Github
  </Button>
);

GithubAuthButton.propTypes = {
  authenticateUser: PropTypes.func,
};

export default connect(
  () => ({}),
  { authenticateUser }
)(GithubAuthButton);

