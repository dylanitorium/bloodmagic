import React from 'react';
import { connect } from 'react-redux';
import { Segment, Grid, Statistic } from 'semantic-ui-react';
import ConfigurationsList from './configurations/ConfigurationsList';
import config from '../../config';

const formatMegaBytes = (bytes) => `${parseInt(bytes / 1000000)}`

const Dashboard = ({  }) => (
  <div>
    <Segment>
      <Grid columns="equal">
        <Grid.Row>
          <Grid.Column textAlign={"center"}>
            <Statistic
              value={`1 / ${config.MAX_CONFIGS}`}
              label="Configurations"
            />
          </Grid.Column>
          <Grid.Column textAlign={"center"}>
            <Statistic
              value={`1 / ${formatMegaBytes(config.MAX_ARTIFACT_SIZE)}`}
              label="Artifact Capacity (mb)"
            />
          </Grid.Column>
          <Grid.Column textAlign={"center"}>
            <Statistic
              value={`1 / ${config.MAX_CONFIGS}`}
              label="Configurations"
            />
          </Grid.Column>
          <Grid.Column textAlign={"center"}>
            <Statistic
              value={`1 / ${config.MAX_CONFIGS}`}
              label="Configurations"
            />
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Segment>
    <ConfigurationsList />
  </div>
);

export default connect(
  () => ({})
)(Dashboard);
