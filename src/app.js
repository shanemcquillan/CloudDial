var express = require('express'),		
		mongoose = require('mongoose'),
		everyauth = require('everyauth'); everyauth.debug = true;

var app = module.exports = express.createServer();
mongoose.connect('mongodb://127.0.0.1:27017/clouddial');

require('./config/auth.js')(everyauth);
require('./config/environment.js')(app, express, everyauth);
require('./config/routes.js')(app);

app.listen(4444);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);