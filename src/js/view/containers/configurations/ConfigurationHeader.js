import React from 'react';
import { Grid, Button, Icon } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';

const ConfigurationHeader = ({ push }) => (
  <Grid>
    <Grid.Row>
      <Grid.Column>
        <Button basic onClick={() => push('/')}>
          <Icon name="angle left" /> Back to Configurations
        </Button>
      </Grid.Column>
    </Grid.Row>
  </Grid>
);

export default connect(
  () => ({}),
  { push }
)(ConfigurationHeader);
