var Module = require('./Module').Module,
    net = require('net');

// Note: 30 ms per tick
// 74 ticks per in-game day

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

function gameline_spoken(o) {
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
  return days;
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

var current_year, nextyear_timer = null;

function nextyear() {
  nextyear_timer = null;
  ++current_year;
  set_next_year_timer(leapyear(current_year) ? 366 : 365);
  broadcast('Happy new year! It is now the year '+current_year, '');
}

function set_next_year_timer(days_left) {
  if (nextyear_timer != null) clear_next_year_timer();
  nextyear_timer = setTimeout(nextyear, days_left * 74 * 30);
}

function clear_next_year_timer() {
  if (nextyear_timer == null) clearTimeout(nextyear_timer);
  nextyear_timer = null;
}

function gameline_date(o) {
  var d = o[1], m = o[2]-1, y = o[3];
  var days = ConvertMDToDays(y,m,d);
  var days_left = leapyear(y) ? 366-days : 365-days;
  current_year = y;
  console.log('It is the year '+current_year+'. '+days_left+' days until new years.');
  set_next_year_timer(days_left);
}

function gameline(msg) {
  var o;
  o = msg.match(/^.?\[All\] (.*)/);
  if (o) return gameline_spoken(o);
  o = msg.match(/^\*\*\* ([^ ]+) has joined the game/);
  if (o) return broadcast(o[1]+' has joined OpenTTD', '');
  o = msg.match(/^\*\*\* ([^ ]+) has left the game(.*)/);
  if (o) return broadcast(o[1]+' has left OpenTTD'+o[2], '');
  o = msg.match(/^Date: (\d+)-(\d+)-(\d+)$/);
  if (o) return gameline_date(o);
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
  conn.write('getdate\n');
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
