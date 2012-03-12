exports.saveBookmark = function(req, res) {
	User.update(
		{ 'username': req.user._doc.username }, 
		{ '$push': { 'bookmarks': { 'address': req.body.address, 'imgAddress': req.body.imgAddress, 'tags': req.body.tags, 'private': req.body.private } } },
		false,
		false
	);

	//Add bookmark if it is not already added, otherwise update it
	Bookmark.findOne({ 'address': req.body.address }, function(err, bookmark) {
		if(err) throw err;
		if(!bookmark) {
			var newBookmark = new Bookmark();
			newBookmark.address = req.body.address;
			newBookmark.imgAddresses = bookmarkUtils.initImgCount(req.body.imgAddress);
			newBookmark.tags = bookmarkUtils.initTagCount(req.body.tags);
			newBookmark.save();
		} else {
			bookmark.imgAddresses = bookmarkUtils.updateImgCount(bookmark._doc.imgAddresses, req.body.imgAddress);
			bookmark.tags = bookmarkUtils.updateTagCount(bookmark._doc.tags, req.body.tags);
			bookmark.markModified('tags');
			bookmark.markModified('imgAddresses');
			bookmark.save(function(err) {
				if(err) throw err;
			});
		}
	});
};

exports.saveScreen = function(req, res) {
	if(req.loggedIn) {
		Bookmark.findOne({ 'address': req.query.address }, function(err, bookmark) {
			if(err) throw err;
			var suggImgs = new Array(), suggTags = new Array();
			if(bookmark) {
				suggImgs = filterImages(bookmark._doc);		//TODO: Include these
				suggTags = filterTags(bookmark._doc);
			}
			google_images.getImageUrls(utils.arrayToString(suggTags), function(imgUrls) {
				top_terms_client.getTopTerms(req.query.address, function(topTerms) {
					res.render(
						'savescreen', 
						{ 
							title: req.query.title, 
							address: req.query.address, 
							pop_images: suggImgs,
							goog_images: imgUrls, 
							pop_tags: suggTags,
							top_tags: topTerms
						}
					);
				});
			});
		});
	} else {
		res.render('index');
	}
}

function filterImages(bookmark) {
	var orderedImgAddresses = new Array();
	var imgAddresses = bookmark.imgAddresses.sort(function(a, b) { return a.ammount > b.ammount ? -1 : 1 });
	for(var i = 0; i < imgAddresses.length; i++) {
		orderedImgAddresses.push(imgAddresses[i].address);
	}
	return orderedImgAddresses;
}

function filterTags(bookmark) {
	var orderedTags = new Array();
	var tags = bookmark.tags.sort(function(a, b) { return a.ammount > b.ammount ? -1 : 1 });
	for(var i = 0; i < tags.length; i++) {
		orderedTags.push(tags[i].tag);
	}
	return orderedTags;
}