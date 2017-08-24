const rexec = require('remote-exec');
const os = require('os');
const fs = require('fs');
const path = require('path');
const createGzip = require('zlib').createGzip;
const through = require('stream').PassThrough;

const downloadSshKeyToTmpDir = (admin, { user, hostSshKey }) => {
  return new Promise((resolve, reject) => {
    const storagePath = `${user}/keys/${hostSshKey}`;
    const localPath = path.resolve(os.tmpdir(), 'key.pem');
    admin.storage()
      .bucket()
      .file(storagePath)
      .download({
        destination: localPath,
      }, (err) => {
        if (err) {
          return reject(err);
        }
        return resolve(localPath);
      });
  });
};

const getDockerCommand = ({ mysqlDocker, mysqlDockerName }) => {
  if (!mysqlDocker) {
    return '';
  }

  return `docker exec ${mysqlDockerName}`;
};

const getMysqlCommand = ({ mysqlHost, mysqlUser, mysqlPassword, mysqlName }) => {
  const host = `-h ${mysqlHost}`;
  const user = `-u ${mysqlUser}`;
  const password = (mysqlPassword) ? `-p${mysqlPassword}` : '';

  return `mysqldump ${host} ${user} ${password} ${mysqlName}`;
};

const pipeExport = (admin, configuration) => (
  (keyPath) => {
    return new Promise((resolve, reject) => {
      const { host, hostUser } = configuration;
      const dockerCommand = getDockerCommand(configuration);
      const mysqlCommand = getMysqlCommand(configuration);
      const stream = new through();

      rexec(
        [ host ],
        [ `${dockerCommand} ${mysqlCommand}` ],
        {
          port: 22,
          username: hostUser,
          privateKey: fs.readFileSync(keyPath),
          stdout: stream,
          stderr: process.stderr
        },
        () => {
          stream.end(() => {
            resolve();
          });
        }
      );

      const uploadWriteStream = admin.storage().bucket().file('myFirstExport.sql.gz').createWriteStream({
        validation: false,
      });

      stream.pipe(new createGzip()).pipe(uploadWriteStream);
      stream.on('error', (error) => {
        reject(error);
      });
    });
  }
);

const types = {
  mysql: (admin, configuration) => {
    const {
      hostAuthMethod,
    } = configuration;

    if (hostAuthMethod === 'key') {
      return downloadSshKeyToTmpDir(admin, configuration).then(pipeExport(admin, configuration));
    }
  },
};

module.exports = (admin) => (
  (req, res) => {
    const { configExportType } = req.configuration;
    const process = types[configExportType];
    process(admin, req.configuration)
      .then(() => {
        res.status(200).json({ success });
      })
      .catch((error) => {
        res.status(500).json(error);
      });
  }
);