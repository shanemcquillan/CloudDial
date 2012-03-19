var mongoose = require('mongoose');
var config = require('../config/config.json');
mongoose.connect('mongodb://' + config.db_ip + '/' + config.db_name);

var user = require('../models/user.js');
var should = require('should');
var promise = require('everyauth').Promise;

describe('Users', function(){
	beforeEach(function(done){
		var prom = new promise();
		user.findOrCreateByUidAndNetwork(10, 'facebook', {'username': 'test'}, prom, done);
	});

	afterEach(function(done){
		user.removeUser('test', done);
	});

	//Tests
	it('finds existing user', function(done){
		user.findUserByUsername('test', function(err, usr){
			usr._doc.username.should.equal('test');
			done();
		});
	});

	it('user does not exist', function(done){
		user.findUserByUsername('fake', function(err, usr){
			should.not.exist(usr);
			done();
		});
	});

	it('adding bookmark to user', function(done){
		user.addBookmark('test', {'address': 'www.test.com', 'imgAddress': 'www.testimage.com', 'tags': ['test1', 'test2'], 'private': false}, function(err){
			user.findUserByUsername('test', function(er, usr){
				usr._doc.bookmarks[0].address.should.equal('www.test.com');
				usr._doc.bookmarks[0].imgAddress.should.equal('www.testimage.com');
				usr._doc.bookmarks[0].tags[0].should.equal('test1');
				usr._doc.bookmarks[0].tags[1].should.equal('test2');
				done();
			});
		});
	});
	
	it('gets public bookmarks only', function(done){
		user.addBookmark('test', {'address': 'www.test.com', 'imgAddress': 'www.testimage.com', 'tags': ['test1'], 'private': false}, function(err){
			user.addBookmark('test', {'address': 'www.test2.com', 'imgAddress': 'www.testimage.com', 'tags': ['test1'], 'private': true}, function(err){
				user.getBookmarks(
					'test', 
					function(bkmrk) {
						return !bkmrk.private;
					}, 
					function(bkmrks) {
						bkmrks.length.should.equal(1);
						bkmrks[0].address.should.equal('www.test.com');
						done();
					}
				);
			});	
		});		
	});

	it('get bookmarks of non existing user', function(done){
		user.getBookmarks(
			'fake', 
			function(bkmrk) {},
			function(bkmrks) {
				should.not.exist(bkmrks);
				done();
			}
		);	
	});
});