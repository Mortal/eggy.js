var net = require('net'),
    irc = require('./irc'),
    Listener = require('./Listener').Listener;

var bot = new irc.Client('irc.eu.gamesurge.net', 'eggyjs', {
  debug: true,
  channels: ['#concerned'],
});

var listeners = [];

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
