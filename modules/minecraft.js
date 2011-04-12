var Module = require('./Module').Module,
		net = require('net'),
		lolmc = require('lolmc');
var m = new Module();
var mc = new lolmc.Minecraft();
function broadcast(msg, src) {
	if (src != 'irc') m.say('#concerned', msg.replace(/Alakala/gi, 'kala'));
	if (src != 'mc') mc.say(msg);
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
mc.on('unknown', function (line) {
	broadcast(line);
});
mc.on('exception', function (lines) {
	broadcast(lines[0]);
});
m.notcommand('.', function (data) {
	broadcast(data.from+": "+data.line, 'irc');
});
m.event(function (data) {
	broadcast("* "+data.line, 'irc');
});
