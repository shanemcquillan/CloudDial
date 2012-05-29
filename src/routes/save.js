var async = require('async');
var user = require('../models/user.js');
var bookmark = require('../models/bookmark.js');
var utils = require('../utils.js');
var google_images = require('../libs/google_images.js');
var page_parser = require('../libs/page_parser.js');
var suggestor_client = require('../libs/suggestor_client.js');

exports.saveBookmark = function(req, res) {
	if(req.user) {
		var bkmrk = {'title': req.body.title, 'address': req.body.address, 'imgAddress': req.body.imgAddress, 'tags': req.body.tags, 'description': req.body.description, 'private': req.body.private};
		user.addBookmark(req.user._doc.username, req.body.group, bkmrk, function(err){});
		bookmark.addBookmark({'address': req.body.address, 'imgAddress': req.body.imgAddress, 'tags': req.body.tags}, function(err){});
	}
};

exports.saveScreen = function(req, res) {
	if(!(req.query.address)) return;		//Sanitisation

	var makeSuggestions = function(page) {
		bookmark.getBookmarkTags(req.query.address, function(err, tagsObj){
			var tags = mergeWithoutDups(tagsObj.popularTags, tagsObj.suggestedTags);
			async.parallel(
				{
					groupNames: function(callback){
						user.getGroupNames(req.user._doc.username, callback);
					},
					popularImages: function(callback){
						bookmark.getBookmarkImages(req.query.address, callback);
					},
					inlineImages: function(callback){
						var media = page.media, inlineImages = new Array();
						if(media) {
							for(var i = 0; i < media.length; i++) {
								if(media[i].type === 'image') {
									inlineImages.push(media[i].link);
								}
							}
						}
						callback(null, inlineImages);
					},
					suggestedImages: function(callback){
						var terms = new Array();
						if(page.title) {
							terms = page.title.split(' ');
						} else {
							var numTags = tags.length > 0 ? (tags.length > 3 ? 3 : tags.length) : 0;
							for(var i = 0; i < numTags; i++){
								terms.push(tags[i]);
							}
						}

						google_images.getImageUrls(terms, callback);
					},
					suggestedGroup: function(callback){
						if(!req.query.group) {
							suggestGroup(req.user._doc.username, tags, callback);
						} else {
							callback(null, req.query.group);
						}
					},
					description: function(callback){
						bookmark.getBookmarkDescription(req.query.address, callback);
					}
				},
				function(err, results)
				{
					res.render(
						'savescreen', 
						{ 
							'title': page.title,
							'address': req.query.address, 
							'groups': results.groupNames,
							'images': mergeWithoutDups(results.popularImages, results.inlineImages, results.suggestedImages).splice(0,10),
							'tags': tags.splice(0,10),
							'sugg_group': results.suggestedGroup,
							'description': (page.summary ? page.summary : results.description)
						}
					);
				}
			);
		});
	}

	if(req.loggedIn) {
		bookmark.exists(req.query.address, function(err, exists){
			page_parser.getPage(req.query.address, function(err, page){
				if(!exists) {	//Adding bookmark for first time
					suggestor_client.callSuggestor(page, function(err, suggestions){
						bookmark.addBookmark({ address: req.query.address, suggestedTags: suggestions.tags, description: suggestions.summary }, function(err){
							makeSuggestions(page);
						});
					});
				} else {
					makeSuggestions(page);
				}
			});
		});
	} else {	//User is not logged in
		res.render('index');
	}
};

function suggestGroup(username, suggTags, callback) {
	var groupScores = new Array();
	user.getTagAmountsByGroup(username, function(groupTags) {
		user.getGroupNames(username, function(err, groupNames){
			for(var i = 0; i < groupNames.length; i++) {
				var score = 0;
				suggTags.forEach(function(tg) {
					if(groupTags[groupNames[i]][tg]) {
						score+=groupTags[groupNames[i]][tg];
					}
				});
				groupScores.push(score);
			}
			var suggGroup = groupNames[utils.getMaxIndex(groupScores)];
			callback(err, suggGroup);
		});
	});
}

function mergeWithoutDups() {	//takes variable number of arguments
	var exists = {};
	var merged = new Array();
	for(var i = 0; i < arguments.length; i++) {
		var currArray = arguments[i];
		for(var j = 0; j < currArray.length; j++) {
			var element = currArray[j];
			if(!exists[element]) {
				exists[element] = true;
				merged.push(element);
			}
		}
	}
	return merged;
}