// Native
const PassThrough = require('stream').PassThrough;
const os = require('os');
const path = require('path');
const createGzip = require('zlib').createGzip;

// NPM
const rexec = require('remote-exec');

/**
 * @param firebaseApp
 * @param artifactConfiguration
 * @param artifactName
 * @returns {Promise}
 */
async function mysqlArtifact(firebaseApp, artifactConfiguration, artifactName) {
  const {
    key,
    host,
    hostAuthMethod,
    hostUser,
    hostSshKey,
    hostPassword,
    mysqlDocker,
    mysqlDockerName,
    mysqlHost,
    mysqlUser,
    mysqlPassword,
    mysqlName,
    user,
  } = artifactConfiguration;

  const stream = new PassThrough();

  const baseConnectionOptions = {
    port: 22,
    username: hostUser,
    stdout: stream,
  };

  let connectionOptions;
  if (hostAuthMethod === 'key') {
    const privateKeyReadStream = await getSshConnectionOptions(firebaseApp, user, hostSshKey);
    connectionOptions = {
      ...baseConnectionOptions,
      privateKey: privateKeyReadStream,
    };
  } else if (hostAuthMethod === 'password') {
    connectionOptions = {
      ...baseConnectionOptions,
      password: hostPassword,
    };
  } else {
    throw new Error('Invalid host authentication method');
  }

  const remoteCommand = [
    (mysqlDocker) ? ['docker', 'exec', mysqlDockerName ].join(' ') : '',
    'mysqldump',
    '-h',
    mysqlHost,
    '-u',
    mysqlUser,
    (mysqlPassword) ? ['-p', mysqlPassword].join('') : '',
    mysqlName,
  ].join(' ');

  const referencePath = [user, '/artifacts/', key, '/', artifactName, '.sql.gz'].join('');
  const reference = firebaseApp.storage().bucket().file(referencePath);
  const artifactWriteStream = reference.createWriteStream();
  const gzipTransformStream = new createGzip();

  rexec(
    [ host ],
    [ remoteCommand ],
    connectionOptions,
    () => stream.end(),
  );

  stream.pipe(gzipTransformStream).pipe(artifactWriteStream);

  return new Promise((resolve, reject) => {
    stream
      .on('error', reject)
      .on('finish', resolve)
  });
}

/**
 * @param firebaseApp
 * @param user
 * @param hostSshKey
 * @returns {Promise}
 */
async function getSshConnectionOptions(firebaseApp, user, hostSshKey) {
  const referencePath = [ user, 'keys', hostSshKey ].join('/');
  const reference = firebaseApp.storage().bucket().file(referencePath);
  const localPath = path.resolve(os.tmpdir(), 'key');

  return new Promise((resolve, reject) => {
    reference.download({
      destination: localPath,
    }, (error) => {
      if (error) {
        return reject(error);
      }
      return resolve();
    });
  });
}

/**
 * @param artifactConfiguration
 * @returns {*}
 */
function getArtifactTypeFromConfiguration(artifactConfiguration) {
  return artifactConfiguration.exportConfigType;
}

/**
 * @param artifactType
 * @returns {mysqlArtifact}
 */
function getExportFunctionForArtifactType(artifactType) {
  if (artifactType === 'mysql') {
    return mysqlArtifact;
  } else {
    throw new Error('Invalid artifact type');
  }
}

/**
 * @param request
 * @returns {*}
 */
function getArtifactConfigurationFromRequest(request) {
  return request.configuration;
}

/**
 * @param request
 */
function getArtifactKeyFromRequest(request) {
  return request.body.key;
}

/**
 * @param firebaseApp
 * @param artifactName
 */
function setArtifactRecordAsSuccessful(firebaseApp, artifactName) {
  const referencePath = `artifacts/${artifactName}`;
  const reference = firebaseApp.database().ref(referencePath);
  reference.set({
    status: 'complete',
  });
}

/**
 * @param firebaseApp
 * @param artifactName
 */
function setArtifactRecordAsFailed(firebaseApp, artifactName) {
  const referencePath = `artifacts/${artifactName}`;
  const reference = firebaseApp.database().ref(referencePath);
  reference.set({
    status: 'complete',
  });
}

/**
 * @param firebaseApp
 */
module.exports = (firebaseApp) => (
  (request, response) => {
    try {
      const artifactConfiguration = getArtifactConfigurationFromRequest(request);
      const artifactKey = getArtifactKeyFromRequest(request);
      const artifactType = getArtifactTypeFromConfiguration(artifactConfiguration);
      const method = getExportFunctionForArtifactType(artifactType);
      const result = method(firebaseApp, artifactConfiguration, artifactKey);
      result.then(() => {
        setArtifactRecordAsSuccessful(firebaseApp, artifactConfiguration);
        response.status(200).end();
      });
      result.catch(() => {
        setArtifactRecordAsFailed(firebaseApp, artifactConfiguration);
        response.status(500).send(error.message);
      });
    } catch (error) {
      setArtifactRecordAsFailed(firebaseApp, artifactConfiguration);
      response.status(500).send(error.message);
    }
  }
);