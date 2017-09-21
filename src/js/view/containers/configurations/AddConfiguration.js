import React from 'react';
import { Segment } from 'semantic-ui-react';
import ConfigurationHeader from './ConfigurationHeader';
import ConfigurationsForm from './ConfigurationsForm';

export default () => (
  <div>
    <ConfigurationHeader/>
    <Segment>
      <ConfigurationsForm/>
    </Segment>
  </div>
)
