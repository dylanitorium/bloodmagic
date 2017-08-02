const express = require('express');
const http = require('http');
const fs = require('fs');
const spawn = require('child_process').spawn;

const EXPORT_NAME = '/Users/deadsalt/export.tar.gz';
const PORT = process.env.PORT || '8866';

const service = express();

const createExport = (response) => {
  return new Promise((resolve, reject) => {
    const createExport = spawn('sh', [
      '/Users/deadsalt/Projects/nzccp/public_html/_scripts/export-db-docker.sh',
      '/Users/deadsalt/export.sql'
    ]);
    createExport.on('close', () => {
      resolve();
    })
  });
};

const createTar = (response) => {
  return new Promise((resolve, reject) => {
    const createExport = spawn('tar', [
      '-cvzf',
      EXPORT_NAME,
      '/Users/deadsalt/export.sql'
    ]);
    createExport.on('close', () => {
      resolve();
    })
  });
};

const sendFile = (response) => {
  return new Promise((reject, resolve) => {
    response.download(EXPORT_NAME, 'export.tar.gz');
    return resolve();
  });
};

service.get('*', (request, response) => {
  createExport(response)
    .then(() => createTar(response))
    .then(() => sendFile(response))
    .catch(console.error);
});

service.listen(PORT);
