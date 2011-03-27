var sys = require('sys');

function Listener(socket, bot) {
  process.EventEmitter.call(this);
  var self = this;
  self.debug('get listener');
  self.socket = socket;
  self.bot = bot;
  socket.on('data', function (data) {
    var lines = data.toString().split('\n');
    self.debug('receive data: '+lines.length+' lines');
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
    self.debug('lose listener');
    self.emit('end');
  });
}
sys.inherits(Listener, process.EventEmitter);

Listener.prototype.receiveLine = function (line) {
  this.debug('receive line '+line);
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

Listener.prototype.debug = function (msg) {
};

Listener.commands = {};
Listener.commands.identify = function (args) {
  console.log("Module identified as "+args);
  this.name = args;
};
Listener.commands.command = function (args) {
  this.addCommand(args, true);
};
Listener.commands.notcommand = function (args) {
  this.addCommand(args, false);
};
Listener.commands.event = function (args) {
  var self = this;
  var listeners = {
    join: function (channel, who) {
      self.socket.write('event '+channel+' '+who+' joined channel '+channel+'\n');
    },
    part: function (channel, who, reason) {
      self.socket.write('event '+channel+' '+who+' leaves channel '+channel+' ('+reason+')\n');
    },
    kick: function (channel, who, by, reason) {
      self.socket.write('event '+channel+' '+who+' was kicked out of '+channel+' by '+by+' ('+reason+')\n');
    },
    topic: function (channel, topic, who) {
      self.socket.write('event '+channel+' '+who+' changed topic of '+channel+' to: '+topic+'\n');
    }
  };
  for (var ev in listeners) {
    self.bot.addListener(ev, listeners[ev]);
  }
  self.on('end', function () {
    for (var ev in listeners) {
      self.bot.removeListener(ev, listeners[ev]);
    }
  });
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
      self.debug("Got command matching "+re);
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
Listener.commands.nick = function (args) {
  var nick = args.replace(/ .*/, '');
  if (nick.length) {
    this.bot.send("NICK", nick);
  }
};
Listener.defaultCommand = function (cmd, args) {
  this.socket.write('Unknown command\n');
};

exports.Listener = Listener;

/* vim:set ts=8 sw=2 sts=2: */
