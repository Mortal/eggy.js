var Module = require('./Module').Module,
		net = require('net');
var m = new Module();
var mc = net.createConnection('/tmp/minecraft');
function ondata(data) {
	var lines = data.toString().split('\n');
	for (var i = 0, l = lines.length; i < l; ++i) {
		var line = lines[i];
		var o = line.match(/^20\d\d-..-.. ..:..:.. \[INFO\] (.*)/);
		if (!o) return;
		line = o[1];
		o = line.match(/^<[^>]*> .*/);
		if (o) {
			m.say('#concerned', line.replace(/Alakala/g, 'kala'));
			return;
		}
		o = line.match(/^([a-zA-Z0-9]+) .* logged in with entity id/);
		if (o) {
			m.say('#concerned', o[1]+' is now playing Minecraft');
			return;
		}
		o = line.match(/^([a-zA-Z0-9]+) lost connection: (.*)/);
		if (o) {
			m.say('#concerned', o[1]+' quit Minecraft: '+o[2]);
		}
	}
}
setTimeout(function () {
	mc.on('data', ondata);
}, 1000);
m.notcommand('.', function (data) {
	mc.write('say '+data.from+': '+data.line+'\n');
});
