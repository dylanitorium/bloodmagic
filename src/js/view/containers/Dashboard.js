import React from 'react';
import { connect } from 'react-redux';
import { Segment, Grid, Statistic } from 'semantic-ui-react';
import ConfigurationsList from './configurations/ConfigurationsList';
import _ from 'lodash';
import config from '../../config';

const formatMegaBytes = (bytes) => `${Math.ceil(parseFloat(bytes / 10000000))}`

const getConfigsCount = list => _.size(list);
const getTotalSize = list => formatMegaBytes(_.reduce(list, (sum, item) => item.metadata ?  item.metadata.size + sum : 0, 0));
const getRunsCount = (user) => user.exportCount;
const getDownloadsCount = (user) => user.downloadCount;

const Dashboard = ({ artifacts, configurations, user }) => (
  <div>
    <Segment>
      <Grid columns="equal">
        <Grid.Row>
          <Grid.Column textAlign={"center"}>
            <Statistic
              size="small"
              value={`${getConfigsCount(configurations)} / ${config.MAX_CONFIGS}`}
              label="Configurations"
            />
          </Grid.Column>
          <Grid.Column textAlign={"center"}>
            <Statistic
              size="small"
              value={`${getTotalSize(artifacts)} / ${formatMegaBytes(config.MAX_ARTIFACT_SIZE)}`}
              label="Artifact Capacity (mb)"
            />
          </Grid.Column>
          <Grid.Column textAlign={"center"}>
            <Statistic
              size="small"
              value={`${getRunsCount(user)} / ${config.MAX_RUNS}`}
              label="Run Executions"
            />
          </Grid.Column>
          <Grid.Column textAlign={"center"}>
            <Statistic
              size="small"
              value={`${getDownloadsCount(user)}/ ${config.MAX_DOWNLOADS}`}
              label="Downloads"
            />
          </Grid.Column>
        </Grid.Row>
      </Grid>
    </Segment>
    <ConfigurationsList />
  </div>
);

export default connect(
  (state) => ({
    configurations: state.configurations.configurationList,
    artifacts: state.artifacts.artifactList,
    user: state.user,
  })
)(Dashboard);
