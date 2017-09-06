import React, { Component } from 'react';
import _ from 'lodash';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import { Form, Segment, Grid, Button, Icon, Message, Divider } from 'semantic-ui-react';
import { saveConfiguration, clearConfigurationMessage, runConfiguration } from 'state/configurations/actions';
import SemanticUploadField from '../../../lib/semantic-upload-field/index';
import FireBaseUploadField from '../../components/configurations/FireBaseUploadField';

const fields = {
  configTitle: '',
  configExportType: '',
  host: '',
  hostUser: '',
  hostSshKey: '',
  hostPassword: '',
  hostAuthMethod: '',
  mysqlName: '',
  mysqlHost: '',
  mysqlUser: '',
  mysqlPassword: '',
  mysqlPort: '',
  mysqlDocker: false,
  mysqlDockerName: '',
  dashUser: '',
  dashApiKey: '',
  dashProject: '',
  dashMode: '',
  dashEnv: '',
};

class ConfigurationsForm extends Component {
  /**
   *
   * @param props
   */
  constructor(props) {
    super(props);
    this.state = this.getInitialState();

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  /**
   *
   */
  getCurrentUserId() {
    const {
      user: {
        uid,
      }
    } = this.props;

    return uid;
  }

  /**
   * @returns {string}
   */
  getConfigKeyFromTitle() {
    const {
      configTitle
    } = this.state;

    return configTitle.replace(' ', '').toLowerCase();
  }

  /**
   * Load state from current configuration or initialise empty fields
   * for controlled inputs
   *
   * return {*}
   */
  getInitialState() {
    const { configuration } = this.props;
    return {
      ...fields,
      ...configuration
    };
  }

  /**
   * Gets the value from the state
   */
  getValueFromState(field) {
    return this.state[field];
  }

  /**
   * Get a state message
   *
   * @returns {*}
   */
  getMessage() {
    if (this.props.message) {
      const {
        message,
        messageType,
        cleaConfigurationMessage,
      } = this.props;

      clearConfigurationMessage();

      return (
        <Message
          error={messageType === 'error'}
          success={messageType === 'success'}
          header={messageType === 'error' ? 'Uh oh!' : 'Hurrah!'}
          content={message}
        />
      );
    }
    return null;
  }

  /**
   * Updates the state on a field change
   * @param e
   * @param name
   * @param value
   * @param checked
   */
  handleChange(e, { name, value, checked }) {
    this.setState({ [name]: value || checked || '' });
  }

  handleSubmit() {
    const user = this.getCurrentUserId();
    const key = this.props.configuration.key || this.getConfigKeyFromTitle();

    const data = {
      ...this.state,
      key,
      user,
    };

    this.props.saveConfiguration(data);
  }

  getDashFields() {
    const modeOptions = [
      { key: 'db', value: 'db', text: 'db' },
      { key: 'assets', value: 'assets', text: 'assets' },
      { key: 'both', value: 'both', text: 'both' },
    ];

    const envOptions = [
      { key: 'prod', value: 'prod', text: 'prod' },
      { key: 'uat', value: 'uat', text: 'uat' },
    ];

    return (
      <div>
        <Form.Field>
          <Divider horizontal>User Account</Divider>
          <Segment>
            <Form.Input
              label="User"
              name="dashUser"
              placeholder=""
              value={this.getValueFromState('dashUser')}
              onChange={this.handleChange}
              required
            />
            <Form.Input
              label="API Key"
              name="dashApiKey"
              placeholder=""
              value={this.getValueFromState('dashApiKey')}
              onChange={this.handleChange}
              required
            />
          </Segment>
        </Form.Field>
        <Form.Field style={{ marginBottom: '1em' }}>
          <Divider horizontal>Project</Divider>
          <Segment>
            <Form.Input
              label="Project"
              name="dashProject"
              placeholder="eg. website.com"
              value={this.getValueFromState('dashProject')}
              onChange={this.handleChange}
              required
            />
            <Form.Select
              label="Snapshot Mode"
              name="dashMode"
              options={modeOptions}
              placeholder="Select a mode"
              value={this.getValueFromState('dashMode')}
              onChange={this.handleChange}
              required
            />
            <Form.Select
              label="Snapshot Environment"
              name="dashEnv"
              options={envOptions}
              placeholder="Select an environment"
              value={this.getValueFromState('dashEnv')}
              onChange={this.handleChange}
              required
            />
          </Segment>
        </Form.Field>
      </div>
    );
  }

  getMysqlFields() {
    const authTypes = [
      {
        key: 'key',
        text: 'SSH Private Key',
        value: 'key',
      },
      {
        key: 'password',
        text: 'Password',
        value: 'password',
      },
    ];

    return (
      <div>
        <Form.Field>
          <Divider horizontal>Host</Divider>
          <Segment>
            <Form.Input
              label="Host"
              name="host"
              placeholder="eg. website.com"
              value={this.getValueFromState('host')}
              onChange={this.handleChange}
              required
            />
            <Form.Input
              label="Host Username"
              name="hostUser"
              placeholder="eg. ubuntu"
              value={this.getValueFromState('hostUser')}
              onChange={this.handleChange}
              required
            />
            <Form.Select
              label="Authentication Method"
              name="hostAuthMethod"
              options={authTypes}
              placeholder="Select a method"
              value={this.getValueFromState('hostAuthMethod')}
              onChange={this.handleChange}
              required
            />
            {this.getAuthFields()}
          </Segment>
        </Form.Field>
        <Divider horizontal>Database</Divider>
        <Form.Field style={{ marginBottom: '1em' }}>
          <Segment>
            <Form.Input
              label="Database Name"
              name="mysqlName"
              placeholder=""
              value={this.getValueFromState('mysqlName')}
              onChange={this.handleChange}
              required
            />
            <Form.Input
              label="Database Host"
              name="mysqlHost"
              placeholder="127.0.0.1"
              value={this.getValueFromState('mysqlHost')}
              onChange={this.handleChange}
            />
            <Form.Input
              label="Database Username"
              name="mysqlUser"
              placeholder=""
              value={this.getValueFromState('mysqlUser')}
              onChange={this.handleChange}
              required
            />
            <Form.Input
              label="Database Password"
              name="mysqlPassword"
              placeholder="If Applicable"
              type="password"
              value={this.getValueFromState('mysqlPassword')}
              onChange={this.handleChange}
            />
            <Form.Input
              label="Database Port"
              name="mysqlPort"
              placeholder="3306"
              value={this.getValueFromState('mysqlPort')}
              onChange={this.handleChange}
            />
            <Form.Checkbox
              label="Is the database inside a docker container (and isn't exposed to the host)?"
              name="mysqlDocker"
              checked={this.getValueFromState('mysqlDocker')}
              onChange={this.handleChange}
            />
            {this.getDockerFields()}
          </Segment>
        </Form.Field>
      </div>
    );
  }

  getDockerFields() {
    if (this.state.mysqlDocker) {
      return (
        <Form.Input
          label="Docker Container Name"
          name="mysqlDockerName"
          placeholder=""
          value={this.getValueFromState('mysqlDockerName')}
          onChange={this.handleChange}
          required
        />
      );
    }
  }

  getSshField() {
    return (
      <FireBaseUploadField
        baseRef={`${this.props.user.uid}/keys`}
        label="SSH Private Key"
        name="hostSshKey"
        required
        value={this.getValueFromState('hostSshKey')}
        onChange={this.handleChange}
      />
    );
  }

  getPasswordField() {
    return (
      <Form.Input
        label="Host Password"
        name="hostPassword"
        type="password"
        required
        value={this.getValueFromState('hostPassword')}
        onChange={this.handleChange}
      />
    )
  }

  getAuthFields() {
    if (this.state.hostAuthMethod == 'key') {
      return this.getSshField();
    }

    if (this.state.hostAuthMethod == 'password') {
      return this.getPasswordField();
    }
  }

  getExportConfigFields() {
    if (this.state.configExportType === 'mysql') {
      return this.getMysqlFields();
    }

    if (this.state.configExportType === 'dash') {
      return this.getDashFields();
    }

    return null;
  }

  render() {
    const configurationTypes = [
      {
        key: 'mysql',
        text: 'mysql',
        value: 'mysql',
      },
    ];

    return (
      <div>
        {this.getMessage()}
        <Form onSubmit={this.handleSubmit}>
          <Form.Input
            label="Title"
            name="configTitle"
            placeholder="eg. My Site Export"
            onChange={this.handleChange}
            value={this.getValueFromState('configTitle')}
            required
          />
          <Form.Select
            label="Export Type"
            name="configExportType"
            options={configurationTypes}
            placeholder="Select an export type"
            value={this.getValueFromState('configExportType')}
            onChange={this.handleChange}
            required
          />
          {this.getExportConfigFields()}
          <Form.Button loading={this.props.isFetching} disabled={this.props.isFetching}>Save</Form.Button>
        </Form>
      </div>
    );
  }
}

export default connect(
  state => ({
    isFetching: state.configurations.isFetching,
    message: state.configurations.message,
    messageType: state.configurations.messageType,
    configurations: state.configurations.configurationList,
    user: state.user.currentUser,
  }),
  {
    push,
    saveConfiguration,
    clearConfigurationMessage,
    runConfiguration
  }
)(ConfigurationsForm);
