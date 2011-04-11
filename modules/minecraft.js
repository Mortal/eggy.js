var Module = require('./Module').Module,
		net = require('net'),
		lolmc = require('lolmc');
var m = new Module();
var mc = new lolmc.Minecraft();
mc.on('message', function (sender, message) {
	var line = sender+": "+message;
	m.say('#concerned', line.replace(/Alakala/gi, 'kala'));
});
mc.on('consolemessage', function (message) {
	var line = "[Console] "+message;
	m.say('#concerned', line.replace(/Alakala/gi, 'kala'));
});
mc.on('latency', function (latency) {
	if (latency > 2000) {
		console.log("Latency to minecraft server: "+latency+"ms");
	}
});
mc.on('login', function (username) {
	m.say('#concerned', username+' is now playing Minecraft');
});
mc.on('logout', function (username, reason) {
	m.say('#concerned', username+' quit Minecraft: '+reason);
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
	mc.say(line);
	m.say('#concerned', line);
});
mc.on('exception', function (lines) {
	var line = lines[0];
	mc.say(line);
	m.say('#concerned', line);
});
/*
mc.on('warning', function (line) {
	mc.say(line);
	m.say('#concerned', line);
});
*/
m.notcommand('.', function (data) {
	var line = data.from+": "+data.line;
	mc.say(line);
});
m.event(function (data) {
	var line = "* "+data.line;
	mc.say(line);
});
