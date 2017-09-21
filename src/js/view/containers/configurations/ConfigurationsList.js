import React, { Component } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { Grid, Segment, Dimmer, Loader, Button, Table, Icon, Card, Dropdown } from 'semantic-ui-react';
import _ from 'lodash';
import { getConfigurations, deleteConfiguration } from '../../../state/configurations/actions';

import LoadingList from '../../components/configurations/LoadingList';
import ConfigurationCard from './ConfigurationCard';
import NoConfigurations from '../../components/configurations/NoConfigurations';


class ConfigurationsList extends Component {
  getListRows() {
    const configurations = this.props.list
    return _.keys(configurations).map(key => (
      <ConfigurationCard
        key={key}
        config={configurations[key]}
        onClick={() => this.props.push(`/configuration/${key}`)}
      />
    ));
  }

  getView() {
    const loader = (this.props.isFetching) ? <Dimmer inverted active><Loader>Updating</Loader></Dimmer> : '';

    if (_.isEmpty(this.props.list)) {
      if (this.props.isFetching) {
        return <Loader active>Loading</Loader>;
      }

      return <NoConfigurations/>
    }

    if (this.props.isFetching) {
      return (
        <Segment>
          <Dimmer inverted active><Loader>Updating</Loader></Dimmer>
          <Card.Group>{this.getListRows()}</Card.Group>
        </Segment>
      );
    }

    return <Segment><Card.Group>{this.getListRows()}</Card.Group></Segment>;
  }

  render() {

    return (
      <div>
        <Grid>
          <Grid.Row>
            <Grid.Column>
              <Button basic onClick={() => this.props.push('/new')}>Add Configuration</Button>
            </Grid.Column>
          </Grid.Row>
        </Grid>
        {this.getView()}
      </div>
    );
  }
}

export default connect(
  state => ({
    list: state.configurations.configurationList,
    isFetching: state.configurations.isFetching,
  }),
  {
    push,
  }
)(ConfigurationsList);

