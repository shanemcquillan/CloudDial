var google_images = require('../libs/google_images.js');
var should = require('should');

describe('Google Image Search', function(){
	//Tests
	it('returns images for search', function(done){
		var searchTerms = ['will', 'smith'];
		google_images.getImageUrls(searchTerms, function(err, imgUrls) {
			imgUrls.length.should.equal(8);
			done();
		})
	});

	it('returns nothing', function(done){
		var searchTerms = new Array();
		google_images.getImageUrls(searchTerms, function(err, imgUrls) {
			imgUrls.length.should.equal(0);
			done();
		})
	});
});