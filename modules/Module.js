var net = require('net'),
		sys = require('sys');
function Module() {
	var self = this;
	process.EventEmitter.call(this);
	var bot = self.bot = net.createConnection('./commandsocket');
	bot.on('data', function (data) {
		var lines = data.toString().split('\n');
		for (var i = 0, l = lines.length; i < l; ++i) {
			if (lines[i].length) {
				console.log(lines[i]);
				self.emit('line', lines[i]);
			}
		}
	});
	self.on('line', function (line) {
		console.log("Got line "+line);
	});
}
sys.inherits(Module, process.EventEmitter);
Module.prototype.say = function (to, msg) {
	this.bot.write('say '+to+' '+msg+'\n');
};
Module.prototype.addHandler = function (type, regex, cb) {
	var self = this;
	var re = new RegExp(regex);
	self.bot.write(type+' '+regex+'\n');
	self.on('line', function (line) {
		var spc = line.indexOf(' ');
		if (spc < 0) return;
		var first = line.substring(0, spc),
			rest = line.substring(spc+1, line.length);
		if (first.toLowerCase() != type) return;

		spc = rest.indexOf(' ');
		if (spc < 0) return;
		var from = rest.substring(0, spc);
		rest = rest.substring(spc+1, rest.length);

		spc = rest.indexOf(' ');
		if (spc < 0) return;
		var to = rest.substring(0, spc);
		rest = rest.substring(spc+1, rest.length);

		var o = rest.match(re);
		if (o) {
			cb.call(self, {from: from, to: to, line: line, arg: o[1] || '', capture: o});
		}
	});
};
Module.prototype.simplecommand = function (regex, cb) {
	this.addHandler('command', '^'+regex+'(?: (.*))?', cb);
};
Module.prototype.command = function (regex, cb) {
	this.addHandler('command', regex, cb);
};
Module.prototype.notcommand = function (regex, cb) {
	this.addHandler('notcommand', regex, cb);
};
exports.Module = Module;
