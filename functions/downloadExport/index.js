const functions = require('firebase-functions');

const express = require('express');
const cors = require('cors');
const app = express();

const validateUser = require('../utils/validateUser');
const validateArtifact = require('../utils/validateArtifact');
const processor = require('./process');
const handle = require('../utils/handle');

module.exports = (firebase) => {
  app.use(cors({ origin: true }));
  app.use(validateUser(firebase));
  app.use(validateArtifact(firebase));

  app.all('*', processor(firebase));

  return functions.https.onRequest(handle(app));
};
