var Module = require('./Module').Module,
    net = require('net');

// Note: 30 ms per tick
// 74 ticks per in-game day

var m = new Module();

function OpenTTDBridge() {
  var self = this;

  var conn = this.conn = net.createConnection('/home/rav/openttd-1.1.4-linux-generic-amd64/openttd.sock');

  conn.on('connect', function () {
    console.log("Connected to openttd socket");
  });

  conn.on('error', function (e) {
    console.log("Error");
    console.log(e);
    console.log(e ? e.stack : '');
  });

  this.linessaid = [];

  var linebuffer = '';
  setTimeout(function () {
    conn.on('data', function (data) {
      var s = data.toString();
      var lines = s.split(/\n+/);
      lines[0] = linebuffer + lines[0];
      for (var i = 0, l = lines.length-1; i < l; ++i) {
	self.gameline(lines[i]);
      }
      linebuffer = lines[l];
    });
    conn.write('getdate\n');
  }, 500);

  this.announced_year = this.current_year = -1;
  this.nextyear_timer = null;
  this.should_announce_new_year = true;
}

OpenTTDBridge.prototype.gamesay = function (msg) {
  var said = msg;
  said = said.replace(/"/g, "''").replace(/[\x00-\x1F]+/g, ' ');
  this.linessaid.push(said);
  this.conn.write('say "'+said+'"\n');
}

OpenTTDBridge.prototype.ircsay = function (msg) {
  var said = msg;
  said = said.replace(/^pii_/i, 'Hiekkaa');
  said = said.replace(/^alakala/i, 'kala');
  said = said.replace(/^([^ ]*:)/, '\x0302$1\x0F');
  m.say('#concerned', said);
};

OpenTTDBridge.prototype.broadcast = function (msg, src) {
  if (src != 'irc') this.ircsay(msg);
  if (src != 'game') this.gamesay(msg);
  this.announce_new_years();
}

OpenTTDBridge.prototype.gameline_spoken = function (o) {
  var line = o[1];
  o = line.match(/^: (.*)/);
  if (o) {
    var idx = this.linessaid.indexOf(o[1]);
    if (idx > -1) {
      while (idx >= 0) {
	this.linessaid.shift();
	--idx;
      }
      return;
    }
  }
  this.broadcast(line, 'game');
}

// from openttd
var days_before_month = [ 0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335, 366 ];

function leapyear(y) {
  if (y % 4) return false;
  if (!(y % 100)) return true;
  if (y % 400) return false;
  return true;
}

function ConvertMDToDays(y,m,d) {
  var days = days_before_month[m];
  if (!leapyear(y) && days >= days_before_month[2]) days--;
  return days+d;
}

function ConvertYMDToDate(y,m,d) {
  function leap_years_till(y) {
    return y == 0 ? 0 : (y - 1) / 4 - (y - 1) / 100 + (y - 1) / 400 + 1;
  }
  function days_till(y) {
    return 365 * y + leap_years_till(y);
  }
  var days = ConvertMDToDays(y,m,d);
  days += days_till(y);
}

OpenTTDBridge.prototype.nextyear = function () {
  this.nextyear_timer = null;
  ++this.current_year;
  this.set_next_year_timer(leapyear(this.current_year) ? 366 : 365);
  if (this.should_announce_new_year) {
    this.announced_year = this.current_year;
    this.broadcast('Happy new year! It is now the year '+this.current_year, '');
  }
  this.should_announce_new_year = false;
};

OpenTTDBridge.prototype.announce_new_years = function () {
  if (this.current_year != this.announced_year) {
    this.announced_year = this.current_year;
    this.broadcast('It is the year '+this.current_year, '');
  }
  this.should_announce_new_year = true;
};

OpenTTDBridge.prototype.set_next_year_timer = function (days_left) {
  if (days_left < 0) return console.log("Negative days_left: "+days_left+'\n'+new Error().stack);
  var self = this;
  if (this.nextyear_timer != null) this.clear_next_year_timer();
  this.nextyear_timer = setTimeout(function () {
    return self.nextyear.apply(self, arguments);
  }, days_left * 74 * 30);
};

OpenTTDBridge.prototype.clear_next_year_timer = function () {
  if (this.nextyear_timer) clearTimeout(this.nextyear_timer);
  this.nextyear_timer = null;
};

OpenTTDBridge.prototype.gameline_date = function (o) {
  var d = parseInt(o[1]), m = parseInt(o[2])-1, y = parseInt(o[3]);
  var days = ConvertMDToDays(y,m,d);
  var days_left = leapyear(y) ? 366-days : 365-days;
  this.current_year = this.announced_year = y;
  console.log('It is the year '+this.current_year+'. '+days_left+' days until new years.');
  this.set_next_year_timer(days_left);
};

OpenTTDBridge.prototype.gameline = function (msg) {
  var o;
  o = msg.match(/^.?\[All\] (.*)/);
  if (o) return this.gameline_spoken(o);
  o = msg.match(/^\*\*\* (.*) has joined the game/);
  if (o) return this.broadcast(o[1]+' has joined OpenTTD', '');
  o = msg.match(/^\*\*\* (.*) has left the game(.*)/);
  if (o) return this.broadcast(o[1]+' has left OpenTTD'+o[2], '');
  o = msg.match(/^Date: (\d+)-(\d+)-(\d+)$/);
  if (o) return this.gameline_date(o);
};

var ottd = new OpenTTDBridge();

/*
m.simplecommand('restart minecraft', function (data) {
  broadcast('Restarting server');
  mc.command('stop');
});
*/
m.notcommand('.', function (data) {
  ottd.broadcast(data.from+": "+data.line, 'irc');
  ottd.announce_new_years();
});
m.event(function (data) {
  ottd.broadcast("* "+data.line, 'irc');
});
/* vim:set sw=2 sts=2 ts=8 noet: */
