var Module = require('./Module').Module,
    net = require('net'),
    lolmc = require('lolmc');
var m = new Module();
var mc = new lolmc.Minecraft();
var mccolors = {
  'black': '\xA70',
  'dark blue': '\xA71',
  'dark green': '\xA72',
  'dark cyan': '\xA73',
  'dark red': '\xA74',
  'purple': '\xA75',
  'gold': '\xA76',
  'gray': '\xA77',
  'dark gray': '\xA78',
  'blue': '\xA79',
  'bright green': '\xA7a',
  'cyan': '\xA7b',
  'red': '\xA7c',
  'pink': '\xA7d',
  'yellow': '\xA7e',
  'white': '\xA7f'
};

var irccolors = ['white', 'black', 'dark blue', 'dark green', 'red', 'dark red', 'purple', 'gold', 'yellow', 'bright green', 'dark cyan', 'cyan', 'blue', 'pink', 'dark gray', 'gray', 'white'];
var nickcolors = [[/nibor/i, 'gold'], [/amb/i, 'yellow'], [/rav/i, 'red'], [/kala/i, 'pink'], [/pii/i, 'dark green'], [/sheeo/i, 'cyan'], [/eggyjs/i, 'blue']];
function nickcolor(nick) {
  for (var i = 0, l = nickcolors.length; i < l; ++i) {
    if (nick.match(nickcolors[i][0])) return nickcolors[i][1];
  }
  return 'gray';
}
function irccolorstominecraft(s) {
  return s.replace(/\x03([0-9][0-9]?)?(?:,([0-9][0-9])?)?/g, function (matched, col1, col2) {
    if (!col1 && 0 !== col1) return '';
    col1 = col1.replace(/^0(.)/, '$1');
    return mccolors[irccolors[col1]];
  });
}
function broadcast(msg, src) {
  msg = msg.replace(/Alakala/gi, 'kala');
  if (src != 'irc') m.say('#concerned', msg);
  if (src != 'mc') mc.say(irccolorstominecraft(msg.replace(/(.{100})..*/, '$1 [trunc]')));
}
mc.on('message', function (sender, message) {
  broadcast(sender+": "+message, 'mc');
});
mc.on('consolemessage', function (message) {
  broadcast("[Console] "+message, 'mc');
});
mc.on('latency', function (latency) {
  if (latency > 2000) {
    console.log("Latency to minecraft server: "+latency+"ms");
  }
});
mc.on('login', function (username) {
  broadcast(username+' is now playing Minecraft', 'mc');
});
mc.on('logout', function (username, reason) {
  broadcast(username+' quit Minecraft: '+reason, 'mc');
});
mc.on('command', function (username, command) {
  if (command == 'list') {
    mc.command('list');
    mc.once('list', function (list) {
      mc.say('Connected players: '+list);
    });
  }
});
//mc.on('exception', function (lines) {
//  broadcast(lines[0]);
//});
m.simplecommand('restart minecraft', function (data) {
  broadcast('Restarting server');
  mc.command('stop');
});
m.notcommand('.', function (data) {
  broadcast(mccolors[nickcolor(data.from)]+data.from+": \xA7f"+data.line, 'irc');
});
m.event(function (data) {
  broadcast("\xA77* "+data.line, 'irc');
});
//m.simplecommand('tnt', function (data) {
//  self.debug(JSON.stringify(data));
//  if (data.from == 'Pii_' || data.from == 'rav') {
//    m.debug("Num: "+data.capture[1]);
//    var num = data.capture[1] || 64;
//    mc.command('give hiekkaa 46 '+num);
//  }
//});
/* vim:set sw=2 sts=2 ts=8 noet: */
