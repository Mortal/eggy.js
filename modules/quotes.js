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
				m.respond("oooooold");
				return;
			}
		}
		quotes.push(data.arg);
		writequotes();
		m.respond("Quote "+quotes.length+" added");
	});
	m.notcommand('^#(-?[0-9]+)?$', function (data) {
		var arg = data.arg;
		if (!arg) {
			m.respond(quotes.length+" quotes");
			return;
		}
		var id = parseInt(data.arg, 10);
		if (id < 0) id = quotes.length+id+1;
		if (id <= 0) return;
		m.respond(quotes[id-1] || '');
	});
	function quotefind(query) {
		var results = [];
		for (var i = 0, l = quotes.length; i < l; ++i) {
			if (quotes[i].indexOf(query) > -1) {
				results.push([i+1, quotes[i]]);
			}
		}
		return results;
	}
	m.simplecommand('find', function (data) {
		var query = data.arg;
		var results = quotefind(query);
		if (results.length == 0) {
			m.respond('No results');
		} else if (results.length == 1) {
			var result = results[0];
			m.respond(result[0]+": "+result[1]);
		} else {
			var resultids = [];
			for (var i = 0, l = results.length; i < l; ++i) {
				resultids.push(results[i][0]);
			}
			m.respond(results.length+" results: "+resultids.join(', '));
		}
	});
	m.notcommand('[eE][gG][gG]|:Y', function (data) {
		if (data.line.match(/^eggy /)) return;
		var o = data.line.match(/^:Y (.+)/);
		if (o) {
			var results = quotefind(o[1]);
			if (results.length) {
				var result = results[Math.floor(results.length*Math.random())][1];
				m.respond(result);
				return;
			}
		}
		var quote = quotes[Math.floor(quotes.length*Math.random())];
		m.respond(quote);
	});
	m.simplecommand('setlast', function (data) {
		quotes[quotes.length-1] = data.arg;
		writequotes();
		m.respond("OK");
	});
});
