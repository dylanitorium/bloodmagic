const functions = require('firebase-functions');
const admin = require('firebase-admin');

const express = require('express');
const cors = require('cors');
const app = express();

// Local
const validateUser = require('./spells/validateUser');
const validateConfiguration = require('./spells/validateConfiguration');
const processor = require('./spells/process');
const handle = require('./spells/handle');


// Initialise App
const firebase = admin.initializeApp(functions.config().firebase);

app.use(cors({ origin: true }));
app.use(validateUser(firebase));
app.use(validateConfiguration(firebase));
app.all('*', processor(firebase));

exports.app = functions.https.onRequest(handle(app));
