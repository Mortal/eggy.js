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
m.notcommand('.', function (data) {
	var line = data.from+": "+data.line;
	mc.say(line);
});
m.event(function (data) {
	var line = "* "+data.line;
	mc.say(line);
});
