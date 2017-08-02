const express = require('express');
const http = require('http');
const fs = require('fs');
const spawn = require('child_process').spawn;
const createGzip = require('zlib').createGzip;
const through = require('stream').PassThrough;
const rexec = require('remote-exec');
const path = require('path');

const PORT = process.env.PORT || '8866';
const COMMAND = process.env.COMMAND;

const stream = new through();

const options = {
  port: 22,
  username: 'centos',
  privateKey: fs.readFileSync('/Users/deadsalt/.ssh/nzccp01.pem'),
  stdout: stream,
};

const host = [ 'nzccp.co.nz' ];

const command = [ COMMAND ];

const executable = (cmd) => {
  return cmd.split(' ').shift();
};

const params = (cmd) => {
  return cmd.split(' ').splice(1);
};

const gzip = () => {
  return new createGzip();
};

const service = express();

service.get('*', (request, response) => {
  response.attachment('export.sql.gz');
  rexec(host, command, options, (error) => {
    if (error) {
      console.log(error);
    }
    response.end();
  });
  stream.pipe(gzip()).pipe(response).on('error', console.error);
});

service.listen(PORT);



