var args = process.argv;
for (var i = 2, l = args.length; i < l; ++i) {
	console.log(args[i]);
	require('./modules/'+args[i]);
}
