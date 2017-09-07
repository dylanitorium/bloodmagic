// Native
const PassThrough = require('stream').PassThrough;
const os = require('os');
const fs = require('fs');
const path = require('path');
const createGzip = require('zlib').createGzip;

// NPM
const rexec = require('remote-exec');
const moment = require('moment');

/**
 * @param firebaseApp
 * @param artifactConfiguration
 * @param artifactName
 * @returns {Promise}
 */
function mysqlArtifact(firebaseApp, artifactConfiguration, artifactName) {
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

  const baseConnectionOptions = {
    port: 22,
    username: hostUser,
    stdout: stream,
    readyTimeout: 20000,
  };

  /**
   * There is no async / await in the node v6.11 run time so start a promise chain
   * so we can get some stuff from another promise without having to have the duplication of code
   * or creating other superfluous functions that will need a bunch of arguments passed through
   */
  return Promise.resolve()
    .then(() => {
      if (hostAuthMethod === 'key') {
        return getPrivateKey(firebaseApp, user, hostSshKey)
          // Object assign because there is no spread operators in node v6.11
          .then((privateKeyBuffer) => (Object.assign({}, baseConnectionOptions, {
              privateKey: privateKeyBuffer,
            })));
      } else if (hostAuthMethod === 'password') {
        // Object assign because there is no spread operators in node v6.11
        return Object.assign({}, baseConnectionOptions, {
          password: hostPassword,
        });
      } else {
        throw new Error(`Invalid host authentication method - ${hostAuthMethod}`);
      }
    })
    .then((connectionOptions) => {
      return new Promise((resolve, reject) => {
        rexec(
          [ host ],
          [ remoteCommand ],
          connectionOptions,
          (error) => {
            if (error) {
              throw error;
            }
            stream.end();
          }
        );

        stream.pipe(gzipTransformStream).pipe(artifactWriteStream);

        stream
          .on('error', reject);

        artifactWriteStream
          .on('error', reject)
          .on('finish', () => resolve(referencePath));
      });
    });
}

/**
 * @param firebaseApp
 * @param user
 * @param hostSshKey
 * @returns {Promise}
 */
function getPrivateKey(firebaseApp, user, hostSshKey) {
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
  }).then(() => fs.readFileSync(localPath));
}

/**
 * @param artifactConfiguration
 * @returns {*}
 */
function getArtifactTypeFromConfiguration(artifactConfiguration) {
  return artifactConfiguration.configExportType;
}

/**
 * @param artifactType
 * @returns {mysqlArtifact}
 */
function getExportFunctionForArtifactType(artifactType) {
  if (artifactType === 'mysql') {
    return mysqlArtifact;
  } else {
    throw new Error(`Invalid artifact type - ${artifactType}`);
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
 * @returns {*}
 */
function getArtifactKeyFromRequest(request) {
  return request.body.artifactKey;
}

/**
 * @param firebaseApp
 * @param artifactName
 * @param fileReferencePath
 */
function setArtifactRecordAsSuccessful(firebaseApp, artifactName, fileReferencePath) {
  const referencePath = `artifacts/${artifactName}`;
  const dataReference = firebaseApp.database().ref(referencePath);
  const fileReference = firebaseApp.storage().bucket().file(fileReferencePath);

  return fileReference.getMetadata().then((data) => {
    const metadata = data[0];
    return dataReference.update({
      metadata,
      status: 'complete',
    });
  });
}

/**
 * @param firebaseApp
 * @param artifactName
 */
function setArtifactRecordAsFailed(firebaseApp, artifactKey) {
  const referencePath = `artifacts/${artifactKey}`;
  const reference = firebaseApp.database().ref(referencePath);
  return reference.update({
    status: 'failed',
  });
}


/**
 * 1. Create a record with a pending status
 * 2. Do the actual export
 * 3. Update the record
 *
 * @param firebaseApp
 */
module.exports = (firebaseApp) => (
  (request, response) => {
    const artifactConfiguration = getArtifactConfigurationFromRequest(request);
    const artifactKey = getArtifactKeyFromRequest(request);
    const artifactType = getArtifactTypeFromConfiguration(artifactConfiguration);
    const method = getExportFunctionForArtifactType(artifactType);
    method(firebaseApp, artifactConfiguration, artifactKey)
      .then((fileReferencePath) => (setArtifactRecordAsSuccessful(firebaseApp, artifactKey, fileReferencePath)))
      .then(() => response.status(200).end())
      .catch((error) => {
        console.error(error);
        setArtifactRecordAsFailed(firebaseApp, artifactKey);
        response.status(500).send(error.message);
      });
  }
);
