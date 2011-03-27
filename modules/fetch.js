var Module = require('./Module').Module,
		http = require('http');
var m = new Module();
m.catchall(function (data) {
	var line = data.line;
	var urlpattern = /(?:http:\/\/[^\/]+|www\.[^\/]+)\/\S*\.(?:jpe?g|gif|png)/g;
	var urls = line.match(urlpattern);
	if (!urls || !urls.length) return;
	for (var i = 0, l = urls.length; i < l; ++i) {
		var match = urls[i];
		var filename = match.replace(/.*\//, '');
		m.respond('Fetching '+filename);
	}
});
