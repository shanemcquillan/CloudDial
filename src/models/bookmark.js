var Bookmark = function() {

	var mongoose = require('mongoose');
	var Schema = mongoose.Schema;
	
	var BookmarkSchema = new Schema({
		address: {'type': String, 'required': true},
		imgAddresses: {'type': [ImgAddressSchema], 'required': false},
		popularTags: {'type': [TagSchema], 'required': false},
		suggestedTags: {'type': [TagSchema], 'required': false},
		description: {'type': String, 'required': false}
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

	function imagesCount(bkmrk, imgAddress) {
		if(imgAddress) {
			var originalImages = bkmrk._doc.imgAddresses;
			if(!originalImages) {
				var retImage = new Array();
				retImage.push({ 'address': imgAddress, 'amount': 1 });
				return retImage;			
			} else {
				var exists = false;
				for(var i = 0; i < originalImages.length; i++) {
					if(originalImages[i].address === imgAddress) {
						originalImages[i].amount++;
						exists = true;
						break;
					}
				}
				if(!exists) {
					originalImages.push({ 'address': imgAddress, 'amount': 1 });
				}
				return originalImages;
			}
		}
	}

	function tagsCount(bkmrk, tags) {
		var retTags = new Array();
		if(tags) {
			var originalTags = bkmrk._doc.popularTags;
			if(!originalTags) {
				for(var i = 0; i < tags.length; i++) {
					var tagAndCount = { 'tag': tags[i], 'amount': 1 };
					retTags.push(tagAndCount);
				}		
			} else {
				var existingTags = new Array(),	i, j;

				for(i = 0; i < originalTags.length; i++) {	//Add original
					retTags[i] = originalTags[i];
				}

				for(i = 0; i < tags.length; i++) {			//Update existing
					for(j = 0; j < retTags.length; j++) {
						if(retTags[j].tag === tags[i]) {
							existingTags[i] = true;
							var newAmount = retTags[j].amount+1;
							retTags[j] = {'tag': tags[i], 'amount': newAmount};
							break;
						}
					}
				}

				for(i = 0; i < tags.length; i++) {			//Add remaining
					if(!existingTags[i]) {
						retTags.push({'tag': tags[i], 'amount': 1});
					}
				}			
			}
		}		
		return retTags;		
	}

	return {
		addBookmark: function(bkmrk, callback) {
			this.findByAddress(bkmrk.address, function(err, oldBkmrk){
				if(oldBkmrk) {
					oldBkmrk.imgAddresses = imagesCount(oldBkmrk, bkmrk.imgAddress);
					oldBkmrk.popularTags = tagsCount(oldBkmrk, bkmrk.tags);
					oldBkmrk.markModified('imgAddresses');
					oldBkmrk.markModified('popularTags');
					oldBkmrk.save(callback);
				} else {
					var newBkmrk = new model();
					newBkmrk.address = bkmrk.address;
					newBkmrk.suggestedTags = bkmrk.suggestedTags;
					newBkmrk.imgAddresses = imagesCount(newBkmrk, bkmrk.imgAddress);
					newBkmrk.popularTags = tagsCount(newBkmrk, bkmrk.popularTags);
					newBkmrk.description = bkmrk.description;
					newBkmrk.save(callback);
				}
			});
		},

		exists: function(address, callback) {
			this.findByAddress(address, function(err, bkmrk){
				callback(err, bkmrk ? true : false);
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
				callback(err, orderedImgAddresses);
			});
		},

		getBookmarkTags: function(address, callback) {
			this.findByAddress(address, function(err, bkmrk){
				var popularTags = new Array();
				var suggestedTags = new Array();
				if(bkmrk) {
					var tags = bkmrk._doc.popularTags.sort(function(a, b) { return a.amount > b.amount ? -1 : 1 });
					for(var i = 0; i < tags.length; i++) {
						popularTags.push(tags[i].tag);
					}

					tags = bkmrk._doc.suggestedTags.sort(function(a, b) { return a.amount > b.amount ? -1 : 1 });
					for(var i = 0; i < tags.length; i++) {
						suggestedTags.push(tags[i].tag);
					}
				}
				callback(err, {'popularTags': popularTags, 'suggestedTags': suggestedTags});
			});
		},

		getBookmarkDescription: function(address, callback) {
			this.findByAddress(address, function(err, bkmrk){
				if(bkmrk) {
					callback(err, bkmrk.description);
				}
			});
		}
	};

}();
module.exports = Bookmark;