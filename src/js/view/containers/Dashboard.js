import React from 'react';
import { connect } from 'react-redux';
import { Segment, Grid, Statistic } from 'semantic-ui-react';
import ConfigurationsList from './configurations/ConfigurationsList';
import _ from 'lodash';
import config from '../../config';

const formatMegaBytes = (bytes, decimals) => `${parseFloat(bytes / 1000000).toFixed(decimals)}`

const getConfigsCount = list => _.size(list);
const getTotalSize = (list) => {
  const reduction = _.reduce(list, (accumulator, item) => {
    let addition = 0;
    if (item.metadata) {
      addition = parseInt(item.metadata.size, 10);
    }

    if (isNaN(parseInt(accumulator, 10))) {
      const firstItem = accumulator;
      let initial = 0;
      if (firstItem.metadata) {
        initial = parseInt(firstItem.metadata.size, 10);
      }
      return initial + addition;
    }

    return addition + accumulator;
  });

  console.log('reduction', reduction);
  return formatMegaBytes(reduction, 1);
}
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
              value={`${getTotalSize(artifacts)} / ${formatMegaBytes(config.MAX_ARTIFACT_SIZE, 0)}`}
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
