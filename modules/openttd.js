var Module = require('./Module').Module,
    net = require('net');

var m = new Module();
var conn = net.createConnection('/home/rav/openttd-1.1.4-linux-generic-amd64/openttd.sock');

conn.on('connect', function () {
  console.log("Connected");
});

conn.on('error', function (e) {
  console.log("Error");
  console.log(e);
});

var linessaid = [];
function gamesay(msg) {
  var said = msg.replace(/"/g, "''").replace(/[\x00-\x1F]+/g, ' ');
  linessaid.push(said);
  conn.write('say "'+said+'"\n');
}

function broadcast(msg, src) {
  if (src != 'irc') m.say('#concerned', msg.replace(/^([^ ]*)/, '\x0302$1\x0F'));
  if (src != 'game') gamesay(msg);
}

function gameline(msg) {
  console.log(msg);
  var o = msg.match(/^.?\[All\] (.*)/);
  console.log(o);
  if (!o) return;
  var line = o[1];
  o = line.match(/^: (.*)/);
  console.log(o);
  if (o) {
    var idx = linessaid.indexOf(o[1]);
    console.log(idx);
    if (idx > -1) {
      while (idx >= 0) {
	linessaid.shift();
	--idx;
      }
      return;
    }
  }
  broadcast(line, 'game');
}

var linebuffer = '';
function conndata(data) {
  console.log("data length: "+data.toString().length);
  var s = data.toString();
  var lines = s.split(/\n+/);
  lines[0] = linebuffer + lines[0];
  for (var i = 0, l = lines.length-1; i < l; ++i) {
    gameline(lines[i]);
  }
  linebuffer = lines[l];
}
setTimeout(function () {
  conn.on('data', conndata);
}, 500);

/*
m.simplecommand('restart minecraft', function (data) {
  broadcast('Restarting server');
  mc.command('stop');
});
*/
m.notcommand('.', function (data) {
  broadcast(data.from+": "+data.line, 'irc');
});
m.event(function (data) {
  broadcast("* "+data.line, 'irc');
});
/* vim:set sw=2 sts=2 ts=8 noet: */
