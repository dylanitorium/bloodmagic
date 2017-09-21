import React from 'react';
import { connect } from 'react-redux';
import { Card } from 'semantic-ui-react';
import _ from 'lodash';

const headerStyle = {
  cursor: 'pointer'
};

const ConfigurationCard = ({
  config: { key, configTitle, configExportType },
  artifacts,
  onClick,
}) => {
  const artifactCount = _.filter(artifacts, {configuration: key}).length;

  return (
    <Card>
      <Card.Content>
        <Card.Header
          style={headerStyle}
          onClick={onClick}>
          {configTitle}
        </Card.Header>
        <Card.Meta>
          {configExportType}
        </Card.Meta>
      </Card.Content>
      <Card.Content extra>
        {artifactCount} artifacts
      </Card.Content>
    </Card>
  );
};

export default connect(
  (state) => ({
    artifacts: state.artifacts.artifactList,
  })
)(ConfigurationCard);


