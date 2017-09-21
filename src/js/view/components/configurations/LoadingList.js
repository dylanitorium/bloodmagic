import React from 'react';
import { Segment, Dimmer, Loader } from 'semantic-ui-react';

const segmentStyle = {
  height: '300px',
  border: 0,
  background: 'none',
  boxShadow: 'none',
};

const dimmerStyle = {
  background: 'none',
};

export default ()  => (
  <Segment style={segmentStyle} >
    <Dimmer active inverted style={dimmerStyle}>
      <Loader inverted size="large">
        Loading
      </Loader>
    </Dimmer>
  </Segment>
);
