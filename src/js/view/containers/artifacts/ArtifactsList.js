import React from 'react';
import { connect } from 'react-redux';
import { Grid, Segment, Dimmer, Loader, Button, Table, Icon, Card, Dropdown } from 'semantic-ui-react';
import _ from 'lodash';
import ArtifactCard from './ArtifactCard'

const {
  Component
} = React;

class ArtifactsList extends Component {
  getCards() {
    const artifacts = _.filter(this.props.list, {
      configuration: this.props.configuration.key,
    });
    return _.keys(artifacts).map(key => {
      const artifact = artifacts[key];
      return (
        <ArtifactCard key={key} artifact={artifact} />
      );
    });
  }

  render() {
    return (
      <Card.Group itemsPerRow="2" stackable>
        {this.getCards()}
      </Card.Group>
    )
  }
}

export default connect(
  state => ({
    list: state.artifacts.artifactList
  })
)(ArtifactsList);
