// Native
const PassThrough = require('stream').PassThrough;
const os = require('os');
const fs = require('fs');
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

      return new Promise((resolve, reject) => {
        stream
          .on('error', reject)
          .on('finish', resolve)
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
  return reference.update({
    status: 'complete',
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
 * @param firebaseApp
 */
module.exports = (firebaseApp) => (
  (request, response) => {
    const artifactConfiguration = getArtifactConfigurationFromRequest(request);
    const artifactKey = getArtifactKeyFromRequest(request);
    const artifactType = getArtifactTypeFromConfiguration(artifactConfiguration);
    try {
      const method = getExportFunctionForArtifactType(artifactType);
      const result = method(firebaseApp, artifactConfiguration, artifactKey);
      result.then(() => {
        setArtifactRecordAsSuccessful(firebaseApp, artifactKey);
        response.status(200).end();
      });
      result.catch((error) => {
        setArtifactRecordAsFailed(firebaseApp, artifactKey);
        response.status(500).send(error.message);
      });
    } catch (error) {
      setArtifactRecordAsFailed(firebaseApp, artifactKey);
      response.status(500).send(error.message);
    }
  }
);