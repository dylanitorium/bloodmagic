const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialise App
const firebase = admin.initializeApp(functions.config().firebase);

const createExport = require('./createExport');
const downloadExport = require('./downloadExport');

exports.createExport = createExport(firebase);
exports.downloadExport = downloadExport(firebase);
