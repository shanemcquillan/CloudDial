var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BookmarkSchema = new Schema({
	address: String,
	imgAddresses: {},
	tags: {}
});

mongoose.model('Bookmark', BookmarkSchema);

exports.Bookmark = mongoose.model('Bookmark');

exports.initImgCount = function(newImage) {
	var retImage = new Array();
	retImage.push({ 'address': newImage, 'ammount': 1 });
	return retImage;
}

exports.initTagCount = function(newTags) {
	var retTags = new Array();
	for(var i = 0; i < newTags.length; i++) {
		var tagAndCount = { 'tag': newTags[i], ammount: 1 };
		retTags.push(tagAndCount);
	}
	return retTags;
}

exports.updateImgCount = function(originalImages, newImage) {
	var exists = false;
	for(var i = 0; i < originalImages.length; i++) {
		if(originalImages[i].address === newImage) {
			originalImages[i].ammount++;
			exists = true;
			break;
		}
	}
	if(!exists) {
		originalImages.push({ 'address': newImage, 'ammount': 1 });
	}
	return originalImages;
}

exports.updateTagCount = function(originalTags, newTags) {
	var existingTags = new Array();		//Boolean array indicating whether tag exists already or not
	var i, j;
	for(j = 0; j < newTags.length; j++) {
		existingTags[j] = false;	//Presume tag does not exist
		for(i = 0; i < originalTags.length; i++) {
			if(originalTags[i].tag === newTags[j]) {
				existingTags[j] = true;		//Oh wait, it does exist.
				originalTags[i].ammount++;
				break;
			}
		}
	}

	for(i = 0; i < newTags.length; i++) {
		if(!existingTags[i]) {		//If the tag does not already exist add it
			var tagAndCount = { 'tag': newTags[i], ammount: 1 };
			originalTags.push(tagAndCount);			
		}
	}

	return originalTags;
}