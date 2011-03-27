var net = require('net'),
		sys = require('sys');
function Module() {
	var self = this;
	process.EventEmitter.call(this);
	var bot = self.bot = net.createConnection('./commandsocket');
	var stack = new Error().stack;
	var caller = this.caller = stack.split('\n')[2].replace(/[^(]*\(/, '').replace(/^[^:]*\//, '').replace(/:.*/, '');
	bot.write('identify '+caller+'\n');
	bot.on('data', function (data) {
		var lines = data.toString().split('\n');
		for (var i = 0, l = lines.length; i < l; ++i) {
			if (lines[i].length) {
				self.emit('line', lines[i]);
			}
		}
	});
}
sys.inherits(Module, process.EventEmitter);
Module.prototype.debug = function (msg) {
	console.log(this.caller+" debug: "+msg);
};
Module.prototype.say = function (to, msg) {
	this.bot.write('say '+to+' '+msg+'\n');
};
Module.prototype.quote = function (line) {
	this.bot.write(line+'\n');
};
Module.prototype.respond = function (msg) {
	this.say(this.recipient, msg);
};
Module.prototype.addHandler = function (type, regex, cb) {
	/* when regex is set, assume lines are of the form:
	 * type.toLowerCase()+' '+from+' '+to+' '+message
	 * when regex is unset, assume lines are of the form:
	 * type.toLowerCase()+' '+to+' '+message
	 */
	var self = this;
	var re = regex ? new RegExp(regex) : null;
	self.bot.write(type+(regex ? ' '+regex : '')+'\n');
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

		if (!regex) {
			cb.call(self, {to: from, line: rest});
			return;
		}

		spc = rest.indexOf(' ');
		if (spc < 0) return;
		var to = rest.substring(0, spc);
		rest = rest.substring(spc+1, rest.length);

		var o = rest.match(re);
		if (o) {
			self.debug("Handling: "+rest);
			self.recipient = to;
			cb.call(self, {from: from, to: to, line: rest, arg: o[1] || '', capture: o});
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
Module.prototype.catchall = function (cb) {
	this.addHandler('notcommand', '.', cb);
};
Module.prototype.event = function (cb) {
	this.addHandler('event', null, cb);
};
exports.Module = Module;
