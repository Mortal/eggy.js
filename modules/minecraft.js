var Module = require('./Module').Module,
		net = require('net');
var m = new Module();
var mc = net.createConnection('/tmp/minecraft');
var swallowlines = {};
function ondata(data) {
	var lines = data.toString().split('\n');
	for (var i = 0, l = lines.length; i < l; ++i) {
		var line = lines[i];
		var o = line.match(/^20\d\d-..-.. ..:..:.. \[INFO\] (.*)/);
		if (!o) return;
		line = o[1];
		o = line.match(/^<[^>]*> .*/);
		if (o) {
			m.say('#concerned', line.replace(/Alakala/gi, 'kala'));
			return;
		}
		o = line.match(/^\[CONSOLE\] (.*)/);
		if (o) {
			var msg = o[1];
			if (swallowlines[msg]) {
				var latency = new Date().getTime() - swallowlines[msg].getTime();
				if (latency > 2000) {
					console.log("Latency to minecraft server: "+latency+"ms");
				}
				delete swallowlines[msg];
			} else {
				m.say('#concerned', line.replace(/Alakala/g, 'kala'));
			}
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
			return;
		}
	}
}
setTimeout(function () {
	mc.on('data', ondata);
}, 1000);
m.notcommand('.', function (data) {
	var line = data.from+": "+data.line;
	swallowlines[line] = new Date;
	mc.write('say '+line+'\n');
});
m.event(function (data) {
	var line = "* "+data.line;
	swallowlines[line] = new Date;
	mc.write('say '+line+'\n');
});
