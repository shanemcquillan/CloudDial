var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
  uid: String,    
  username: String,   
  network: String,
  bookmarks: {}
});

mongoose.model('User', UserSchema);

exports.User = mongoose.model('User');