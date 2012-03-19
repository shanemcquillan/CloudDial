config = require('./config/config.json');		//NOTE: Global variable.
var express = require('express'),		
		mongoose = require('mongoose'),
		everyauth = require('everyauth'); everyauth.debug = true;

var app = module.exports = express.createServer();
mongoose.connect('mongodb://' + config.db_ip + '/' + config.db_name);

require('./config/auth.js')(everyauth);
require('./config/environment.js')(app, express, everyauth);
require('./config/routes.js')(app);

app.listen(config.port);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);