var Module = require('./Module').Module,
		fs = require('fs');
var m = new Module();
fs.readFile('quotes.txt', function (err, data) {
	if (err) {console.log(err.toString()); return;}
	var quotes = data.toString().split('\n');
	if (quotes.length > 0 && quotes[quotes.length-1] == '') quotes.pop();
	function writequotes() {
		fs.writeFile('quotes.txt', quotes.length ? (quotes.join('\n')+'\n') : '');
	}
	m.simplecommand('quoteadd', function (data) {
		var quote = data.arg.toString();
		for (var i = 0, l = quotes.length; i < l; ++i) {
			if (quotes[i] == quote) {
				m.say(data.to, "oooooold");
				return;
			}
		}
		quotes.push(data.arg);
		writequotes();
		m.say(data.to, "Quote "+quotes.length+" added");
	});
	m.notcommand('^#(-?[0-9]+)$', function (data) {
		console.log("Get "+data.arg);
		var id = parseInt(data.arg, 10);
		if (id < 0) id = quotes.length+id;
		if (id <= 0) return;
		m.say(data.to, quotes[id-1] || '');
	});
});
