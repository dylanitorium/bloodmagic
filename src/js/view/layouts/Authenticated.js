import React from 'react';
import { Route } from 'react-router';
import { connect } from 'react-redux';
import NavMenu from '../components/NavMenu';
import ContentContainer from '../components/ContentContainer';
import Dashboard from '../containers/Dashboard';
import ConfigurationsForm from '../containers/configurations/ConfigurationsForm';
import AddConfiguration from '../containers/configurations/AddConfiguration';
import EditConfiguration from '../containers/configurations/EditConfiguration';
import { getConfigurations } from '../../state/configurations/actions';
import { getArtifacts } from '../../state/artifacts/actions';
import { getExtraData } from '../../state/user/actions';

class Authenticated extends React.Component {
  componentDidMount() {
    const { getConfigurations, getArtifacts, getExtraData } = this.props;
    getConfigurations();
    getArtifacts();
    getExtraData();
  }

  render() {

    return (
      <div>
        <NavMenu />
        <ContentContainer>
          <Route path="/new" component={AddConfiguration} />
          <Route path="/configuration/:id" component={EditConfiguration} />
          <Route exact path="/" component={Dashboard} />
        </ContentContainer>
      </div>
    );
  }
};

export default connect(
  () => ({}),
  {
    getConfigurations,
    getArtifacts,
    getExtraData,
  }
)(Authenticated);
