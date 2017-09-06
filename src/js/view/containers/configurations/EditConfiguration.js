import React from 'react';
import { Menu, Segment, Button } from 'semantic-ui-react';
import { connect } from 'react-redux';
import ConfigurationHeader from './ConfigurationHeader';
import ConfigurationsForm from './ConfigurationsForm'
import ArtifactsList from '../artifacts/ArtifactsList';
import { createArtifact } from '../../../state/artifacts/actions';


// TODO add routes to tabs
class EditConfiguration extends React.Component {
  constructor(props){
    super(props)

    this.state = {
      activeTab: 'config'
    };
  }

  getConfiguration() {
    const {
      match: {
        params: {
          id,
        },
      },
      configurations
    } = this.props;

    return configurations[id];
  }

  isActiveTab(tab) {
    const { activeTab } = this.state;
    return tab === activeTab;
  }

  getActiveContent() {
    const { activeTab } = this.state;

    switch (activeTab) {
      case 'config':
        return <ConfigurationsForm configuration={this.getConfiguration()} />;
        break;
      case 'artifacts':
        return <ArtifactsList configuration={this.getConfiguration()} />;
        break;
      case 'delete':
        return;
        break;
    }
  }

  updateActiveTab(tab) {
    return () => {
      this.setState({
        activeTab: tab
      })
    }
  }

  render() {
    const {
      match: {
        params: {
          id,
        },
      }
    } = this.props;

    return (
      <div>
        <ConfigurationHeader />
        <Menu attached="top" tabular>
          <Menu.Item name="config" active={this.isActiveTab('config')} onClick={this.updateActiveTab('config')} />
          <Menu.Item name="artifacts" active={this.isActiveTab('artifacts')} onClick={this.updateActiveTab('artifacts')} />
          <Menu.Item name="delete" color="red" active={this.isActiveTab('delete')} onClick={this.updateActiveTab('delete')} />
          <Menu.Menu position="right">
            <Menu.Item>
              <Button basic color="purple" loading={this.props.isFetching} disabled={this.props.isFetching} onClick={() => this.props.createArtifact(id)}>
                Run
              </Button>
            </Menu.Item>
          </Menu.Menu>
        </Menu>
        <Segment attached="bottom">
          {this.getActiveContent()}
        </Segment>
      </div>
    )
  }
}


export default connect(
  (state) => ({
    configurations: state.configurations.configurationList,
    isFetching: state.artifacts.isFetching
  }),
  {
    createArtifact
  }
)(EditConfiguration);
