const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const app = express();

// Local
const validateUser = require('../utils/validateUser');
const validateConfiguration = require('../utils/validateConfiguration');
const processor = require('./process');
const handle = require('../utils/handle');


module.exports = (firebase) => {
  app.use(cors({ origin: true }));
  app.use(validateUser(firebase));
  app.use(validateConfiguration(firebase));
  app.all('*', processor(firebase));

  return functions.https.onRequest(handle(app));
}


