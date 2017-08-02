const express = require('express');
const http = require('http');
const fs = require('fs');
const spawn = require('child_process').spawn;
const zlib = require('zlib');

const PORT = process.env.PORT || '8866';
const COMMAND = process.env.COMMAND;

const executable = (cmd) => {
  return cmd.split(' ').shift();
};

const params = (cmd) => {
  return cmd.split(' ').splice(1);
};

const gzip = () => {
  return new zlib.createGzip();
};

const service = express();
service.get('*', (request, response) => {
  response.attachment('export.sql.gz');
  spawn(executable(COMMAND), params(COMMAND))
    .stdout
    .pipe(gzip())
    .pipe(response)
    .on('error', console.error);
});
service.listen(PORT);



