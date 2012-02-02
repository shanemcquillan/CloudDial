
/**
 * Module dependencies.
 */

var express = require('express'), 
    routes = require('./routes'), 
    mongoose = require('mongoose'),
    everyauth = require('everyauth');
    
everyauth.debug = true;

var app = module.exports = express.createServer();
//mongoose.connect('mongodb://clouddial:clouddial@staff.mongohq.com:10085/clouddial');

var usersById = {};
var nextUserId = 0;

function addUser (source, sourceUser) {
  var user;
  if (arguments.length === 1) { // password-based
    user = sourceUser = source;
    user.id = ++nextUserId;
    return (usersById[nextUserId] = user);
  } else { // non-password-based
    user = usersById[++nextUserId] = {id: nextUserId};
    user[source] = sourceUser;
  }
  return user;
}

var usersByFbId = {};
everyauth.facebook
  .appId('338275512873340')
  .appSecret('319e257dc1cb7ee64204f19fb51b42d8')
  .findOrCreateUser( function (session, accessToken, accessTokenExtra, fbUserMetadata) {
    return usersByFbId[fbUserMetadata.id] ||
      (usersByFbId[fbUserMetadata.id] = addUser('facebook', fbUserMetadata));
  })
  .redirectPath('/' + everyauth.user);

// Configuration
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  //app.set('view options', { layout: false });
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(express.session({ secret: 'cdsecret' }));
  app.use(everyauth.middleware());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes
app.get('/', routes.index);

everyauth.helpExpress(app);

app.listen(process.env.C9_PORT);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
