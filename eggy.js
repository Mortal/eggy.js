var sys = require('sys'),
    net = require('net'),
    irc = require('./irc'),
    Listener = require('./Listener').Listener;

var bot = new irc.Client('irc.eu.gamesurge.net', 'eggyjs', {
  debug: true,
  channels: ['#concerned'],
});

var listeners = [];

bot.addListener('error', function(message) {
  sys.puts('ERROR: ' + message.command + ': ' + message.args.join(' '));
});

bot.addListener('message#blah', function (from, message) {
  sys.puts('<' + from + '> ' + message);
});

bot.addListener('message', function (from, to, message) {
  sys.puts(from + ' => ' + to + ': ' + message);
});
bot.addListener('pm', function(nick, message) {
  sys.puts('Got private message from ' + nick + ': ' + message);
});
bot.addListener('join', function(channel, who) {
  sys.puts(who + ' has joined ' + channel);
});
bot.addListener('part', function(channel, who, reason) {
  sys.puts(who + ' has left ' + channel + ': ' + reason);
});
bot.addListener('kick', function(channel, who, by, reason) {
  sys.puts(who + ' was kicked from ' + channel + ' by ' + by + ': ' + reason);
});

var commandserver = net.createServer(function (socket) {
  var listener = new Listener(socket, bot);
  var idx = listeners.length;
  listeners.push(listener);
  listener.on('end', function () {
    listeners[idx] = null;
  });
});
commandserver.listen('commandsocket');

/* vim:set ts=8 sw=2 sts=2: */
