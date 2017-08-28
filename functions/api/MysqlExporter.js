const path = require('path');
const os = require('os');
const fs = require('fs');
const rexec = require('remote-exec');
const createGzip = require('zlib').createGzip;
const moment = require('moment');
const through = require('stream').PassThrough;

const HOST_AUTH_METHOD_KEY = 'key';
const HOST_AUTH_METHOD_PASSWORD = 'password';

const BASE_CONNECTION_OPTIONS = {
  port: 22,
};

/**
 * A class to handle MysqlExporting
 *
 * @param app
 * @param configuration
 * @constructor
 */
function MysqlExporter (app, configuration) {
  this.app = app;
  this.configuration = configuration;
  this.stream = new through();
};

/**
 * Begins a chain
 * @returns {Promise.<T>}
 */
MysqlExporter.prototype.start = function () {
  return Promise.resolve();
};

/**
 * Gets a file reference from the firebase app
 * @param name
 * @returns {*}
 */
MysqlExporter.prototype.getFileFromApp = function (name) {
  return this.app.storage().bucket().file(name);
};

/**
 * Gets the path to the remote ssh key in firebase storage
 * @returns {string}
 */
MysqlExporter.prototype.getRemoteKeyLocation = function () {
  const { user, hostSshKey } = this.configuration;
  return [ user, 'keys', hostSshKey ].join('/');
};

/**
 * Gets the path to a locally stored ssh Key
 * @returns {string}
 */
MysqlExporter.prototype.getLocalKeyLocation = function () {
  return path.resolve(os.tmpdir(), 'key');
};

/**
 * Gets the password options for ssh connection
 * @returns {Promise.<{password: *}>}
 */
MysqlExporter.prototype.getConnectionOptionsForPassword = function () {
  const { hostPassword } = this.configuration;
  return Promise.resolve({
    password: hostPassword,
  });
};

/**
 * Downloads the key from storage to a tmp directory
 * @returns {Promise}
 */
MysqlExporter.prototype.getRemoteKeyFromStorage = function () {
  return new Promise((resolve, reject) => {
    this.getFileFromApp(this.getRemoteKeyLocation()).download({
      destination: this.getLocalKeyLocation()
    }, (error) => {
      if (error) {
        return reject(error);
      }
      return resolve();
    });
  });
};

/**
 * Gets the connections option for an sshKey
 */
MysqlExporter.prototype.getConnectionOptionsForSshKey = function () {
  return this.getRemoteKeyFromStorage()
    .then(() => {
      return {
        privateKey: fs.readFileSync(this.getLocalKeyLocation()),
      }
    });
};

/**
 * Get the extra options for the auth method
 * @returns {Promise.<{password: *}>}
 */
MysqlExporter.prototype.getConnectionOptionsForUserMethod = function () {
  const { hostAuthMethod } = this.configuration;
  switch (hostAuthMethod) {
    case HOST_AUTH_METHOD_KEY:
      return this.getConnectionOptionsForSshKey();
      break;
    case HOST_AUTH_METHOD_PASSWORD:
      return this.getConnectionOptionsForPassword();
      break;
  }
};

/**
 * Sets a the ssh connection options for this exporter instance
 */
MysqlExporter.prototype.setConnectionOptions = function () {
  const username = this.configuration.hostUser;
  return this.getConnectionOptionsForUserMethod()
    .then((userOptions) => {
      this.connectionOptions = Object.assign(
        {},

        BASE_CONNECTION_OPTIONS,
        userOptions,
        {
          username,
          stdout: this.getThroughSteam(),
        }
      );
    });
};

/**
 * Prepare the authentication
 */
MysqlExporter.prototype.prepareAuthentication = function () {
  return this.setConnectionOptions();
};

MysqlExporter.prototype.getThroughSteam = function () {
  return this.stream;
};

MysqlExporter.prototype.getRemoteCommand = function () {
  const {
    mysqlDocker,
    mysqlDockerName,
    mysqlHost,
    mysqlUser,
    mysqlPassword,
    mysqlName,
  } = this.configuration;

  return [
    (mysqlDocker) ? ['docker', 'exec', mysqlDockerName ].join(' ') : '',
    'mysqldump',
    '-h',
    mysqlHost,
    '-u',
    mysqlUser,
    (mysqlPassword) ? ['-p', mysqlPassword].join('') : '',
    mysqlName,
  ].join(' ');
};

/**
 *
 * @param callback
 */
MysqlExporter.prototype.createRemoteReadStream = function (callback) {
  const { host } = this.configuration;
  const command = this.getRemoteCommand();
  const options = this.connectionOptions;

  rexec(
    [host],
    [command],
    options,
    () => {
      this.getThroughSteam().end();
    }
  );

  return this.getThroughSteam();
};

MysqlExporter.prototype.getZipWrapper = function () {
  return new createGzip();
}

MysqlExporter.prototype.getExportName = function () {
  const { key, user } = this.configuration;
  return `${user}/artifacts/${key}/${key}-${moment().format('DDMMYYYY')}.sql.gz`;
};

/**
 *
 * @returns {"fs".WriteStream}
 */
MysqlExporter.prototype.getExportDestinationStream = function () {
  return this.getFileFromApp(this.getExportName()).createWriteStream();
};

/**
 *
 */
MysqlExporter.prototype.performExport = function () {
  try {
    this.createRemoteReadStream()
      .pipe(this.getZipWrapper())
      .pipe(this.getExportDestinationStream());
  } catch (error) {
    throw error;
  }
};

/**
 *
 */
MysqlExporter.prototype.promisedStreamEnd = function () {
    return new Promise((resolve, reject) => {
      const stream = this.getThroughSteam();
      stream
        .on('error', (error) => {
          reject(error);
        })
        .on('finish', () => {
          resolve();
        })
    })
};

/**
 * Performs an export
 * @returns {Promise.<TResult>}
 */
MysqlExporter.prototype.export = function () {
    this.prepareAuthentication()
      .then(() => this.performExport())
      .catch(error => { throw error });

    return this.promisedStreamEnd();
};


module.exports = MysqlExporter;