var sys = require('sys');

function Listener(socket, bot) {
  sys.puts('get listener');
  process.EventEmitter.call(this);
  var self = this;
  self.socket = socket;
  self.bot = bot;
  socket.on('data', function (data) {
    var lines = data.toString().split('\n');
    sys.puts('receive data: '+lines.length+' lines');
    for (var i = 0, l = lines.length; i < l; ++i) {
      if (lines[i].length) {
	self.emit('socketline', lines[i]);
      }
    }
  });
  self.on('socketline', function (line) {
    self.receiveLine(line);
  });
  socket.on('end', function () {
    console.log('lose listener');
    self.emit('end');
  });
}
sys.inherits(Listener, process.EventEmitter);

Listener.prototype.receiveLine = function (line) {
  sys.puts('receive line '+line);
  var space = line.indexOf(' ');
  if (space < 0) space = line.length;
  var cmd = line.substring(0, space);
  var args = (space < line.length) ? line.substring(space+1, line.length) : '';
  if (Listener.commands[cmd]) {
    Listener.commands[cmd].call(this, args);
  } else {
    Listener.defaultCommand.call(this, cmd, args);
  }
};

Listener.commands = {};
Listener.commands.command = function (args) {
  this.addCommand(args, true);
};
Listener.commands.notcommand = function (args) {
  this.addCommand(args, false);
};
Listener.prototype.addCommand = function (regex, iscommand) {
  var self = this;
  var re;
  try {
    re = new RegExp(regex);
  } catch (e) {
    self.socket.write("Couldn't parse regex: "+e.toString()+"\n");
    return;
  }
  var listener = function (from, to, message) {
    if (!to.match(/^[#&]/)) return;
    if (iscommand) {
      var match = message.match(/^eggy (.*)/);
      if (!match) return;
      message = match[1];
    }
    if (message.match(re)) {
      console.log("Got command matching "+re);
      self.socket.write((iscommand ? "COMMAND" : "NOTCOMMAND")+" "+from+" "+to+" "+message+"\n");
    }
  };
  self.bot.addListener('message', listener);
  self.on('end', function () {
    self.bot.removeListener('message', listener);
  });
};
Listener.commands.say = function (args) {
  var spc = args.indexOf(' ');
  if (spc < 0) return;
  var to = args.substring(0, spc);
  var msg = args.substring(spc+1, args.length);
  this.bot.say(to, msg);
};
Listener.defaultCommand = function (cmd, args) {
  this.socket.write('Unknown command\n');
};

exports.Listener = Listener;

/* vim:set ts=8 sw=2 sts=2: */
