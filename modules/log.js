var Module = require('./Module').Module,
		fs = require('fs');
require('../date.format');
var m = new Module();
function Log(directory, nameprefix) {
	this.fh = null;
	this.queuedlines = [];
	this.directory = directory;
	this.prefix = nameprefix;
}
Log.prototype.log = function (line) {
	line = new Date().format("UTC:yyyy-mm-dd'T'HH:MM:ss' UTC '")+line;

	if (!this.fh) {
		this.queuedlines.push(line);
		this.openlog();
	} else {
		fs.write(this.fh, line+'\n');
	}
};
function mkdirs(prefix, path, cb) {
	var slash = path.indexOf('/');
	if (slash < 0) {
		cb();
		return;
	}
	var dir = path.substring(0, slash);
	var rest = path.substring(slash+1, path.length);
	m.debug('mkdirs: '+prefix+' '+dir+' '+rest);
	fs.stat(prefix+'/'+dir, function (err, stats) {
		if (err) {
			m.debug('mkdirs: stat returned error, assuming directory doesn\'t exist');
			fs.mkdir(prefix+'/'+dir, 0777, function (err) {
				mkdirs(prefix+'/'+dir, rest, cb);
			});
		} else {
			m.debug('mkdirs: stat returned no error, directory probably exists');
			mkdirs(prefix+'/'+dir, rest, cb);
		}
	});
}
Log.prototype.openlog = function () {
	var self = this;
	if (self.fh) {
		self.closelog();
	}
	var filename = self.directory+'/'+(new Date().format('yyyymm'))+'/'+self.prefix+(new Date().format('yyyymmdd'))+'.txt';
	m.debug("Opening log "+filename);
	mkdirs('.', filename, function () {
		fs.open(filename, 'a', function (err, fd) {
			if (err) {
				throw err;
			}
			self.fh = fd;
			for (var i = 0, l = self.queuedlines.length; i < l; ++i) {
				fs.write(fd, self.queuedlines[i]+'\n');
			}
			self.queuedlines = [];
		});
	});
	self.settimer();
};
Log.prototype.closelog = function () {
	if (this.fh) {
		fs.close(this.fh);
		this.fh = null;
	}
};
Log.prototype.settimer = function () {
	var self = this;
	if (self.timer) self.cleartimer();
	var tomorrow = new Date;
	tomorrow.setDate(tomorrow.getDate()+1);
	tomorrow.setUTCHours(0,0,0,0);
	var until = tomorrow.getTime()-new Date().getTime();
	m.debug("Time to open next log file: "+until+" msec = "+(until/60000/60)+" hours until tomorrow");
	self.timer = setTimeout(function () {
		self.openlog();
	}, until+200);
};
Log.prototype.cleartimer = function () {
	if (this.timer) {
		clearTimeout(this.timer);
		this.timer = null;
	}
};
var channellogs = {};
function log(channel, line) {
	if (channel.charAt(0) == '#') channel = channel.substring(1, channel.length);

	var logger = channellogs[channel];
	if (!logger) {
		logger = channellogs[channel] = new Log('log/channel/'+channel, 'channel.'+channel+'.');
	}
	logger.log(line);
}
m.catchall(function (data) {
	if (data.to.charAt(0) != '#') return;
	var channel = data.to.substring(1, data.to.length);
	log(channel, "<"+data.from+"> "+data.line);
});
m.event(function (data) {
	if (data.to.charAt(0) != '#') return;
	var channel = data.to.substring(1, data.to.length);
	log(channel, '* '+data.line);
});
