var user = require('../models/user.js');

//Account page
module.exports = function(req, res){
	if(!req.query.tags) return;		//Sanitisation
	
	var showPublics = req.user && req.params.id == req.user._doc.username;
	var tags = req.query.tags;
	user.getBookmarks(
		req.params.id,
		function(grp){
			var bookmarks = new Array();
			grp.bookmarks.forEach(function(bkmrk){
				var match = false;
				for(var i = 0; i < tags.length; i++) {
					match = false;
					for(var j = 0; j < bkmrk.tags.length; j++) {
						if(tags[i] === bkmrk.tags[j]) {
							match = true;
							break;	//We found a match, check the next tag
						}
					}
					if(!match) break;	//If any tag searched for doesn't match we stop checking the current bookmark
				}
				if(match) {
					if(!bkmrk.private || showPublics) {
						bookmarks.push(bkmrk);	//Have they all matched?
					}
				}
			});
			grp.bookmarks = bookmarks;
			return true;
		},
		function(grps){
			if(grps) {
				//Returning all bookmarks found without considering grouping
				var bkmrks = new Array();
				grps.forEach(function(grp){
					if(!grp.private || showPublics) {
						grp.bookmarks.forEach(function(bkmrk){
							bkmrks.push(bkmrk);
						});
					}
				});
				res.send(bkmrks);
			}
			else {
				res.send(new Array());
			}
		}
	)
};