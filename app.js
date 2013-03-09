var express = require('express'),		
	mongoose = require('mongoose');
	//everyauth = require('everyauth'); everyauth.debug = true;
passport = require('passport');

config = require('./config/config.json');		//NOTE: Global variable.

var app = module.exports = express.createServer();

var MemoryStore = express.session.MemoryStore;
sessionStore = new MemoryStore();

mongoose.connect('mongodb://' + config.db_ip + '/' + config.db_name);

require('./config/auth.js')(passport);
require('./config/environment.js')(app, express, passport, sessionStore);
require('./config/routes.js')(app);
require('./realtime/bookmark.js')(app, express, sessionStore);

app.listen(process.env.PORT || config.port);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);