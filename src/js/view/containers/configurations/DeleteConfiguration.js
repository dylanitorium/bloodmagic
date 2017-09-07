import React from 'react';
import { connect } from 'react-redux';
import { Form, Message } from 'semantic-ui-react';
import { deleteConfiguration } from '../../../state/configurations/actions';

const {
  Component
} = React;

class DeleteConfiguration extends Component {
  constructor(props) {
    super(props)
    this.state = {
      fieldValue: '',
      message: '',
    }

    this.handleFieldChange = this.handleFieldChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  canSubmit() {
    if (this.state.fieldValue === this.props.configuration) {
      return true;
    }

    this.setState({
      message: 'The name you entered does not match the name of the configuration',
    });

    return false;
  }

  handleSubmit() {
    if (this.canSubmit()) {
      this.props.deleteConfiguration(this.props.configuration);
    }
  }

  handleFieldChange(e) {
    const fieldValue = e.target.value;
    this.setState({
      fieldValue,
    });
  }

  getMessage() {
    if (this.state.message.length) {
      return ( <Message
        error
        header="Nope"
        content={this.state.message}
      />);
    }
    return '';
  }

  render() {
    return (
      <div>
        {this.getMessage()}
        <p>
          Deleting this configuration will remove all settings and all stored artifacts. This is irreversible!
        </p>
        <Form onSubmit={this.handleSubmit}>
          <Form.Input
            label="Enter configuration name to confirm"
            name="host"
            value={this.state.fieldValue}
            onChange={this.handleFieldChange}
            required
          />
          <Form.Button loading={this.props.isFetching} disabled={this.props.isFetching} color="red">Delete</Form.Button>
        </Form>
      </div>
    )
  }
}

export default connect(
  () => ({}),
  {
    deleteConfiguration,
  }
)(DeleteConfiguration);
