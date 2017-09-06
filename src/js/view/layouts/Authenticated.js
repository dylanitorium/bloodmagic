import React from 'react';
import { Route } from 'react-router';
import { connect } from 'react-redux';
import NavMenu from '../components/NavMenu';
import ContentContainer from '../components/ContentContainer';
import ConfigurationsList from '../containers/configurations/ConfigurationsList';
import ConfigurationsForm from '../containers/configurations/ConfigurationsForm';
import AddConfiguration from '../containers/configurations/AddConfiguration';
import EditConfiguration from '../containers/configurations/EditConfiguration';
import { getConfigurations } from '../../state/configurations/actions';
import { getArtifacts } from '../../state/artifacts/actions';

class Authenticated extends React.Component {
  componentDidMount() {
    const { getConfigurations, getArtifacts } = this.props;
    getConfigurations();
    getArtifacts();
  }

  render() {

    return (
      <div>
        <NavMenu />
        <ContentContainer>
          <Route path="/new" component={AddConfiguration} />
          <Route path="/configuration/:id" component={EditConfiguration} />
          <Route exact path="/" component={ConfigurationsList} />
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
  }
)(Authenticated);
