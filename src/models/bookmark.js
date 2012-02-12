var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BookmarkSchema = new Schema({
  address: String,
  imgAddress: String
});

mongoose.model('Bookmark', BookmarkSchema);

exports.Bookmark = mongoose.model('Bookmark');