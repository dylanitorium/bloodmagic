import React from 'react';
import SemanticUploadField from 'semantic-upload-field';
import * as firebase from 'firebase';

const {
  Component
} = React;

export default class FireBaseUploadField extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      value: this.props.value || '',
    }

    this.handleChange = this.handleChange.bind(this);
    this.handleRemove = this.handleRemove.bind(this);
  }

  handleChange(e) {
    if (this.state.loading) {
      return;
    }

    const file = e.target.files[0];

    if (!file) {
      return;
    }

    const value = file.name;

    this.setState({
      loading: true,
      value,
    });

    firebase.storage().ref()
      .child(this.getFileReference())
      .put(file)
      .then((snapshot) => {

        this.setState({
          loading: false,
        });

        this.props.onChange(e, {
          name: this.props.name,
          value,
        })
      });
  }

  handleRemove() {
    firebase.storage().ref().child(this.getFileReference()).delete();

    this.setState({
      value: '',
    });

    this.props.onChange({}, {
      name: this.props.name,
      value: '',
    })
  }

  getFileReference() {
    const { baseRef } = this.props;
    const { value } = this.state;
    return `${baseRef}/${value}`;
  }

  render() {
    return (
      <SemanticUploadField
        name={this.props.name}
        label={this.props.label}
        value={this.state.value}
        loading={this.state.loading}
        required={this.props.required}
        onChange={this.handleChange}
        onRemove={this.handleRemove}
      />
    );
  }
}


