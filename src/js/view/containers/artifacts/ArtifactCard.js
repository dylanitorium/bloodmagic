import React from 'react';
import { connect } from 'react-redux';
import { Card, Dimmer, Loader, Dropdown, Icon } from 'semantic-ui-react';
import moment from 'moment';
import { deleteArtifact, downloadArtifact } from '../../../state/artifacts/actions';

const ArtifactCard = ({
  artifact: { key, metadata, status },
  deleteArtifact,
  downloadArtifact
}) => {
  let size = 'Size unknown';
  let time = 'Creating...'
  if (metadata) {
    size = `Size: ${parseFloat(metadata.size / 1000000).toFixed(2)}mb`;
    time = `Created: ${moment(metadata.timeCreated).format('HH:mm DD/MM/YY')}`;
  }

  const loader = (status) === 'pending' ? <Loader size="tiny" inline active /> : '';

  const options = [
    { key: 'download', text: 'Download', onClick: () => downloadArtifact(key) },
    { key: 'delete', text: 'Delete', onClick: () => deleteArtifact(key) }
  ];

  return (
    <Card>
      <Card.Content>
        <Card.Header>
          {loader} {`${key}.sql.gz`}
          <Dropdown style={{ float: 'right' }} trigger={<Icon name="ellipsis vertical" />} options={options} icon={null} />
        </Card.Header>
        <Card.Meta>
          {time} <br />
          {size}
        </Card.Meta>
      </Card.Content>
    </Card>
  );
};


export default connect(
  () => ({}),
  {
    deleteArtifact,
    downloadArtifact
  }
)(ArtifactCard);
