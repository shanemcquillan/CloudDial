var fs = require('fs');

//Include all routes
fs.readdirSync(__dirname).forEach(function(file) {
	if(file !== 'index.js') {
		exports[file.substring(0,file.length-3)] = require(__dirname + '/' + file);
	}
});