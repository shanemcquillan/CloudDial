var user = require('../models/user.js');
var bookmark = require('../models/bookmark.js');
var utils = require('../utils.js');
var google_images = require('../libs/google_images.js');
var top_terms_client = require('../libs/top_terms_client.js');

exports.saveBookmark = function(req, res) {
	user.addBookmark(req.user._doc.username, req.body.group, {'address': req.body.address, 'imgAddress': req.body.imgAddress, 'tags': req.body.tags, 'private': req.body.private}, function(err){});
	bookmark.addBookmark({'address': req.body.address, 'imgAddress': req.body.imgAddress, 'tags': req.body.tags}, function(err){});
};

exports.saveScreen = function(req, res) {		//TODO: Reduce callback nesting (promises, futures etc)
	if(req.loggedIn) {
		user.getGroupNames(req.user._doc.username, function(groups){
			bookmark.getBookmarkImages(req.query.address, function(suggImgs){
				bookmark.getBookmarkTags(req.query.address, function(suggTags){
					google_images.getImageUrls(utils.arrayToString(suggTags), function(imgUrls){
						top_terms_client.getTopTerms(req.query.address, function(topTerms){
							res.render(
								'savescreen', 
								{ 
									title: req.query.title, 
									address: req.query.address, 
									pop_images: suggImgs,
									goog_images: imgUrls, 
									pop_tags: suggTags,
									top_tags: topTerms,
									groups: groups
								}
							);
						});
					});
				});
			});
		});
	} else {
		res.render('index');
	}
}