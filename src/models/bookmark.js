var Bookmark = function() {

	var mongoose = require('mongoose');
	var Schema = mongoose.Schema;
	
	var BookmarkSchema = new Schema({
		address: {'type': String, 'required': true},
		imgAddresses: {'type': [ImgAddressSchema], 'required': false},
		tags: {'type': [TagSchema], 'required': false}
	});

	var ImgAddressSchema = new Schema({
		address: {'type': String, 'required': true},
		amount: {'type': Number, 'required': true}
	});

	var TagSchema = new Schema({
		tag: {'type': String, 'required': true},
		amount: {'type': Number, 'required': true}
	});

	var model = mongoose.model('Bookmark', BookmarkSchema);

	function initImgCount(newImage) {
		var retImage = new Array();
		retImage.push({ 'address': newImage, 'amount': 1 });
		return retImage;
	}

	function initTagCount(newTags) {
		var retTags = new Array();
		for(var i = 0; i < newTags.length; i++) {
			var tagAndCount = { 'tag': newTags[i], 'amount': 1 };
			retTags.push(tagAndCount);
		}
		return retTags;
	}

	function updateImgCount(originalImages, newImage) {	//TODO: Improve
		var exists = false;
		for(var i = 0; i < originalImages.length; i++) {
			if(originalImages[i].address === newImage) {
				originalImages[i].amount++;
				exists = true;
				break;
			}
		}
		if(!exists) {
			originalImages.push({ 'address': newImage, 'amount': 1 });
		}
		return originalImages;
	}

	function updateTagCount(originalTags, newTags) {
		var existingTags = new Array(),
				origTags = new Array(),
				i, j;

		for(i = 0; i < originalTags.length; i++) {
			origTags[i] = originalTags[i];
		}

		for(i = 0; i < newTags.length; i++) {
			for(j = 0; j < origTags.length; j++) {
				if(origTags[j].tag === newTags[i]) {
					existingTags[i] = true;
					var newAmount = origTags[j].amount+1;
					origTags[j] = {'tag': newTags[i], 'amount': newAmount};
					break;
				}
			}
		}

		for(i = 0; i < newTags.length; i++) {
			if(!existingTags[i]) {		//If the tag does not already exist add it
				origTags.push({'tag': newTags[i], 'amount': 1});
			}
		}

		return origTags;
	}

	return {
		addBookmark: function(bkmrk, callback) {
			this.findByAddress(bkmrk.address, function(err, oldBkmrk){
				if(oldBkmrk) {
					oldBkmrk.imgAddresses = updateImgCount(oldBkmrk._doc.imgAddresses, bkmrk.imgAddress);
					oldBkmrk.tags = updateTagCount(oldBkmrk._doc.tags, bkmrk.tags);
					oldBkmrk.markModified('imgAddresses');
					oldBkmrk.markModified('tags');
					oldBkmrk.save(callback);
				} else {
					var newBkmrk = new model();
					newBkmrk.address = bkmrk.address;
					newBkmrk.imgAddresses = initImgCount(bkmrk.imgAddress);
					newBkmrk.tags = initTagCount(bkmrk.tags);
					newBkmrk.save(callback);
				}
			});
		},

		removeBookmark: function(address, callback) {
			this.findByAddress(address, function(err, bkmrk){
				if(err) throw err;
				bkmrk.remove();
				callback();
			});
		},

		findByAddress: function(address, callback) {
			model.findOne({'address': address}, function(err, bkmrk){
				if(err) throw err;
				callback(err, bkmrk);
			});
		},

		getBookmarkImages: function(address, callback) {
			this.findByAddress(address, function(err, bkmrk){
				var orderedImgAddresses = new Array();
				if(bkmrk) {
					var imgAddresses = bkmrk._doc.imgAddresses.sort(function(a, b) { return a.amount > b.amount ? -1 : 1 });
					for(var i = 0; i < imgAddresses.length; i++) {
						orderedImgAddresses.push(imgAddresses[i].address);
					}
				}
				callback(orderedImgAddresses);
			});
		},

		getBookmarkTags: function(address, callback) {
			this.findByAddress(address, function(err, bkmrk){
				var orderedTags = new Array();
				if(bkmrk) {
					var tags = bkmrk._doc.tags.sort(function(a, b) { return a.amount > b.amount ? -1 : 1 });
					for(var i = 0; i < tags.length; i++) {
						orderedTags.push(tags[i].tag);
					}
				}
				callback(orderedTags);
			});
		}
	};

}();
module.exports = Bookmark;