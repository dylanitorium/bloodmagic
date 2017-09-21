import React from 'react';
import { Icon, Progress, Input } from 'semantic-ui-react';

const {
  Component,
} = React;

export default class SemanticUploadField extends Component {
  constructor(props) {
    super(props);

    this.onChange = this.onChange.bind(this);
    this.onRemove = this.onRemove.bind(this);
  }

  getIcon() {
    if (this.props.value) {
      return (<Icon name='delete' link onClick={this.onRemove} />)
    }
  }

  onChange(e) {
    this.props.onChange(e);
  }

  onRemove() {
    this.props.onRemove();
  }

  render () {
    return (
      <div className={`${(this.props.required) ? 'required' : ''} field`}>
        <label>{this.props.label}</label>
          <Input
            loading={this.props.loading}
            icon={this.getIcon()}
            iconPosition='left'
            value={this.props.value}
            input={<input type="text" style={{ opacity: 1 }} disabled />}
            required={this.props.required}
            id={this.props.name}
            name={this.props.name}
            action={
              <label className="ui icon button label" >
                <Icon name="attach" style={{  width: '19px' }} />
                <input type="file" style={{ display: 'none' }} onChange={this.onChange} />
                <input type="hidden" value={this.props.ref} />
              </label>
            }
          />
        </div>
    );
  }
}
