var express = require('express'), 
    routes = require('./routes'), 
    mongoose = require('mongoose'),
    everyauth = require('everyauth'); everyauth.debug = true;

var app = module.exports = express.createServer();
mongoose.connect('mongodb://127.0.0.1:27017/clouddial');

var User = require('./models/user.js').User;

everyauth.facebook
  .appId('338275512873340')
  .appSecret('319e257dc1cb7ee64204f19fb51b42d8')
  .findOrCreateUser(function (session, accessToken, accessTokenExtra, fbUserMetadata) {
      var promise = this.Promise();
      findOrCreateByUidAndNetwork(fbUserMetadata.id, 'facebook', fbUserMetadata, promise);
      return promise;
  })
  .redirectPath('/');

everyauth.everymodule
  .findUserById(function(id, callback) {
    fetchUserById(id, function (err, user) {
      if (err) return callback(err);
      callback(null, user);
    });
  });

function findOrCreateByUidAndNetwork(uid, network, profile, promise) {
  User.find({uid: uid, network: network}, function(err, users){
    if(err) throw err;
    if(users.length > 0) {
      promise.fulfill(users[0]);
    } else {
      var user = new User();
      user.network = network;
      user.uid = uid;
      user.username = profile.username;
      user.bookmarks = {};
      user.save(function(err){
        if (err) throw err;
        promise.fulfill(user);
      });
    }
  });
};

function fetchUserById(id, callback) {
  User.find({_id: id}, function(err, users){
    callback(err, users[0]);
  });
}

// Configuration
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.logger());
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
app.get('/user/*', routes.account);
app.post('/save', routes.saveBookmark);

everyauth.helpExpress(app);

app.listen(4444);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);