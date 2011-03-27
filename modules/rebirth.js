var Module = require('./Module').Module;
var m = new Module();
m.command('rebirth', function (data) {
	var name = data.arg.replace(/ .*/, '');
	if (name.length) {
		m.quote('nick '+name);
	}
});

