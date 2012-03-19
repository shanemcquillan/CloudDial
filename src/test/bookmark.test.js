var mongoose = require('mongoose');
var config = require('../config/config.json');
mongoose.connect('mongodb://' + config.db_ip + '/' + config.db_name);

var bookmark = require('../models/bookmark.js');
var should = require('should');

describe('Bookmarks', function(){
	beforeEach(function(done){
		bookmark.addBookmark({'address': 'www.test.com', 'imgAddress': 'www.testimage.com', 'tags': ['test1', 'test2']}, done);
	});

	afterEach(function(done){
		bookmark.removeBookmark('www.test.com', done);
	});

	//Tests
	it('finds existing bookmark', function(done) {
		bookmark.findByAddress('www.test.com', function(err, bkmrk) {
			bkmrk._doc.address.should.equal('www.test.com');
			bkmrk._doc.imgAddresses[0].address.should.equal('www.testimage.com');
			done();
		});
	});

	it('bookmark does not exist', function(done) {
		bookmark.findByAddress('www.fake.com', function(err, bkmrk) {
			should.not.exist(bkmrk);
			done();
		});
	});

	it('adding different representative image', function(done){
		bookmark.addBookmark({'address': 'www.test.com', 'imgAddress': 'www.testimage2.com', 'tags': [] }, function(err){
			bookmark.findByAddress('www.test.com', function(err, bkmrk) {
				bkmrk._doc.imgAddresses[0].address.should.equal('www.testimage.com');
				bkmrk._doc.imgAddresses[1].address.should.equal('www.testimage2.com');
				done();
			});
		});
	});

	it('adding the same representative image', function(done){
		bookmark.addBookmark({'address': 'www.test.com', 'imgAddress': 'www.testimage.com', 'tags': []}, function(){
			bookmark.findByAddress('www.test.com', function(err, bkmrk) {
				bkmrk._doc.imgAddresses[0].address.should.equal('www.testimage.com');
				bkmrk._doc.imgAddresses[0].amount.should.equal(2);
				done();
			});
		});
	});

	it('adding different representative tag', function(done){
		bookmark.addBookmark({'address': 'www.test.com', 'imgAddress': '', 'tags': ['test3']}, function(err){
			bookmark.findByAddress('www.test.com', function(err, bkmrk) {
				bkmrk._doc.tags[0].tag.should.equal('test1');
				bkmrk._doc.tags[1].tag.should.equal('test2');
				bkmrk._doc.tags[2].tag.should.equal('test3');					
				done();
			});
		});
	});

	it('adding the same representative tag', function(done){
		bookmark.addBookmark({'address': 'www.test.com', 'imgAddress': '', 'tags': ['test1'] }, function(err){
			bookmark.findByAddress('www.test.com', function(err, bkmrk) {
				bkmrk._doc.tags[0].amount.should.equal(2);	
				done();
			});
		});
	});

	it('returns all representative images in order of popularity', function(done){
		bookmark.addBookmark({'address': 'www.test.com', 'imgAddress': 'www.testimage2.com', 'tags': []}, function(err){
			bookmark.addBookmark({'address': 'www.test.com', 'imgAddress': 'www.testimage2.com', 'tags': []}, function(err){
				bookmark.getBookmarkImages('www.test.com', function(images){
					images[0].should.equal('www.testimage2.com');
					images[1].should.equal('www.testimage.com');
					done();
				});
			});
		});	
	});

	it('returns all representative tags in order of popularity', function(done){
		bookmark.addBookmark({'address': 'www.test.com', 'imgAddress': '', 'tags': ['test1', 'test2']}, function(err){
			bookmark.addBookmark({'address': 'www.test.com', 'imgAddress': '', 'tags': ['test2', 'test3']}, function(err1){
				bookmark.getBookmarkTags('www.test.com', function(tags){
					tags[0].should.equal('test2');
					tags[1].should.equal('test1');
					tags[2].should.equal('test3');
					done();
				});
			});
		});
	});
});