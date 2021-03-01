const childProcess = require('child_process');
const EventEmitter = require('events');
const util = require('util');
const JSONStream = require('./json-stream.js');

// the ConnectionLog greps for players logging in/out with journalctl
function ConnectionLog() {
  EventEmitter.call(this);

  const args = [
    '-f',
    '-o',
    'json',
    `--unit ${process.env.journalUnit}`,
    `-g 'character|owner'`,
  ];

  // start journalctl
  console.log('Starting Connection log!');
  try {
    this.ConnectionLog = childProcess.spawn('journalctl', args);
  } catch (e) {
    console.log('error starting connection log: ', e);
  }
  // Setup decoder
  const decoder = new JSONStream((e) => {
    console.log('journalctl event: ', e);
    this.emit('event', e);
  });
  this.ConnectionLog.stdout.on('data', (chunk) => {
    decoder.decode(chunk.toString());
  });
}

util.inherits(ConnectionLog, EventEmitter);

ConnectionLog.prototype.stop = function (cb) {
  // Kill the process
  if (cb) this.ConnectionLog.on('exit', cb);
  this.ConnectionLog.kill();
};

module.exports = ConnectionLog;
