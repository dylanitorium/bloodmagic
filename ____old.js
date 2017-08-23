const express = require('express');
const http = require('http');
const fs = require('fs');
const createGzip = require('zlib').createGzip;
const through = require('stream').PassThrough;
const rexec = require('remote-exec');

const PORT = process.env.PORT || '8866';
const COMMAND = process.env.COMMAND;

const service = express();
service.get('*', (request, response) => {
  response.attachment('export.sql.gz');
  const stream = new through();
  rexec(
    [
      'nzccp.co.nz'
    ],
    [
      'sudo docker exec nzccp mysqldump -h nzccp_mysql -u nzccp -pnzccp nzccp'
    ],
    {
      port: 22,
      username: 'centos',
      privateKey: fs.readFileSync('/Users/deadsalt/.ssh/nzccp01.pem'),
      stdout: stream
    },
    () => response.end()
  );
  stream.pipe(new createGzip()).pipe(response);
});
service.listen(PORT);



